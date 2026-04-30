declare module "fastify" {
  interface FastifyRequest {
    body?: unknown;
    params?: Record<string, string>;
    query?: Record<string, string | undefined>;
  }

  interface FastifyReply {
    code: (statusCode: number) => FastifyReply;
  }

  interface FastifyInstance {
    get: (path: string, handler: (request: FastifyRequest, reply: FastifyReply) => Promise<unknown> | unknown) => void;
    post: (path: string, handler: (request: FastifyRequest, reply: FastifyReply) => Promise<unknown> | unknown) => void;
    listen: (options: { host: string; port: number }) => Promise<void>;
  }

  interface FastifyFactory {
    (options?: { logger?: boolean; bodyLimit?: number }): FastifyInstance;
  }

  const Fastify: FastifyFactory;
  export default Fastify;
}
