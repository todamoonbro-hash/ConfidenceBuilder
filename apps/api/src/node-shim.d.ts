declare const process: {
  env: Record<string, string | undefined>;
};

declare class Buffer extends Uint8Array {
  static from(data: string, encoding?: string): Buffer;
}
