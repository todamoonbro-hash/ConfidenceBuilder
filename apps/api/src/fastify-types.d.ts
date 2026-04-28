declare module "fastify" {
  interface FastifyRequest {
    body?: unknown;
    params?: Record<string, string>;
  }

  interface FastifyInstance {
    get: (path: string, handler: (request: FastifyRequest) => Promise<unknown> | unknown) => void;
    post: (path: string, handler: (request: FastifyRequest) => Promise<unknown> | unknown) => void;
    listen: (options: { host: string; port: number }) => Promise<void>;
  }

  interface FastifyFactory {
    (options?: { logger?: boolean }): FastifyInstance;
  }

  const Fastify: FastifyFactory;
  export default Fastify;
}
