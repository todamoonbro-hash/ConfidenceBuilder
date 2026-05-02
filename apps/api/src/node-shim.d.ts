declare const process: {
  env: Record<string, string | undefined>;
};

declare class Buffer extends Uint8Array {
  static from(data: string | Buffer | ArrayBufferLike | ArrayLike<number>, encoding?: string): Buffer;
  static isBuffer(value: unknown): value is Buffer;
  toString(encoding?: string): string;
}
