export const DEFAULT_USER_ID = process.env.NEXT_PUBLIC_DEFAULT_USER_ID ?? "user_001";

export function resolveUserId(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || DEFAULT_USER_ID;
}
