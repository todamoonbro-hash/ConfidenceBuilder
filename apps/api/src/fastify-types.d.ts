declare module "fastify" {
  interface FastifyLogger {
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    debug: (...args: unknown[]) => void;
  }

  interface FastifyRequest {
    id: string;
    body?: unknown;
    params?: Record<string, string>;
    query?: Record<string, string | undefined>;
    headers: Record<string, string | undefined>;
    method: string;
    url: string;
    ip?: string;
    log: FastifyLogger;
  }

  interface FastifyReply {
    code: (statusCode: number) => FastifyReply;
    status: (statusCode: number) => FastifyReply;
    header: (name: string, value: string) => FastifyReply;
    send: (payload?: unknown) => unknown;
  }

  type FastifyHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<unknown> | unknown;
  type FastifyErrorHandler = (
    error: Error & { statusCode?: number; code?: string },
    request: FastifyRequest,
    reply: FastifyReply
  ) => Promise<unknown> | unknown;

  interface FastifyInstance {
    log: FastifyLogger;
    addHook: (
      name: "onRequest" | "preHandler" | "onResponse" | "onError",
      handler: FastifyHandler
    ) => void;
    get: (path: string, handler: FastifyHandler) => void;
    post: (path: string, handler: FastifyHandler) => void;
    put: (path: string, handler: FastifyHandler) => void;
    delete: (path: string, handler: FastifyHandler) => void;
    setErrorHandler: (handler: FastifyErrorHandler) => void;
    setNotFoundHandler: (handler: FastifyHandler) => void;
    listen: (options: { host: string; port: number }) => Promise<void>;
    close: () => Promise<void>;
  }

  interface FastifyFactory {
    (options?: {
      logger?: boolean;
      bodyLimit?: number;
      genReqId?: () => string;
      disableRequestLogging?: boolean;
    }): FastifyInstance;
  }

  const Fastify: FastifyFactory;
  export default Fastify;
}
