import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

// Lightweight JWT-style HS256 session token. We deliberately avoid pulling in jsonwebtoken / jose to keep
// the API's runtime dep surface minimal until the auth provider decision is finalized.
//
// Activated by AUTH_ENABLED=true. When disabled, isAuthEnabled() returns false and routes fall back to the
// legacy `userId in body/path` model so existing tests keep passing. When enabled, every /v1/* route must
// call requireAuthenticatedUser() before mutating per-user state.

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "cb_session";

export type AuthClaims = {
  sub: string;        // userId
  iat: number;        // issued-at (seconds)
  exp: number;        // expiry (seconds)
  jti: string;        // token id, for future revocation
};

export function isAuthEnabled(): boolean {
  return process.env.AUTH_ENABLED === "true";
}

function getSecret(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("auth_secret_too_short_or_unset");
  }
  return Buffer.from(secret, "utf8");
}

function base64UrlEncode(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  return Buffer.from(padded, "base64");
}

function sign(payload: string, secret: Buffer): string {
  return base64UrlEncode(createHmac("sha256", secret).update(payload).digest());
}

export function issueSessionToken(userId: string): string {
  const secret = getSecret();
  const now = Math.floor(Date.now() / 1000);
  const claims: AuthClaims = { sub: userId, iat: now, exp: now + TOKEN_TTL_SECONDS, jti: randomUUID() };
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(claims));
  const signature = sign(`${header}.${body}`, secret);
  return `${header}.${body}.${signature}`;
}

export function verifySessionToken(token: string): AuthClaims | null {
  try {
    const secret = getSecret();
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, providedSig] = parts;
    const expectedSig = sign(`${header}.${body}`, secret);
    const a = Buffer.from(providedSig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const claims = JSON.parse(base64UrlDecode(body).toString("utf8")) as AuthClaims;
    if (typeof claims.sub !== "string" || typeof claims.exp !== "number") return null;
    if (Math.floor(Date.now() / 1000) >= claims.exp) return null;
    return claims;
  } catch {
    return null;
  }
}

export function buildSessionCookie(token: string, opts: { secure: boolean }): string {
  const flags = [
    `${COOKIE_NAME}=${token}`,
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${TOKEN_TTL_SECONDS}`,
    "Path=/"
  ];
  if (opts.secure) flags.push("Secure");
  return flags.join("; ");
}

export function buildSessionClearCookie(opts: { secure: boolean }): string {
  const flags = [`${COOKIE_NAME}=`, "HttpOnly", "SameSite=Lax", "Max-Age=0", "Path=/"];
  if (opts.secure) flags.push("Secure");
  return flags.join("; ");
}

export function readSessionCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(/;\s*/);
  for (const entry of cookies) {
    const eq = entry.indexOf("=");
    if (eq < 0) continue;
    const name = entry.slice(0, eq);
    const value = entry.slice(eq + 1);
    if (name === COOKIE_NAME) return value;
  }
  return null;
}

export type AuthContext =
  | { ok: true; userId: string; claims: AuthClaims }
  | { ok: false; reason: "auth_disabled" | "missing_token" | "invalid_token" | "expired" };

export function getAuthContextFromHeaders(headers: Record<string, unknown>): AuthContext {
  if (!isAuthEnabled()) return { ok: false, reason: "auth_disabled" };

  // Prefer Authorization: Bearer <token> for API clients; fall back to cookie for browser sessions.
  const authHeader = headers["authorization"];
  let token: string | null = null;
  if (typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")) {
    token = authHeader.slice(7).trim();
  } else {
    const cookieHeader = headers["cookie"];
    if (typeof cookieHeader === "string") {
      token = readSessionCookie(cookieHeader);
    }
  }

  if (!token) return { ok: false, reason: "missing_token" };
  const claims = verifySessionToken(token);
  if (!claims) return { ok: false, reason: "invalid_token" };
  return { ok: true, userId: claims.sub, claims };
}
