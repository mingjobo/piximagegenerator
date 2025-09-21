export class ApicoreError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "ApicoreError";
  }
}

export function isRetryableError(error: any): boolean {
  if (error instanceof ApicoreError) {
    // 网络错误和超时可重试
    return error.statusCode === 429 || (error.statusCode !== undefined && error.statusCode >= 500);
  }
  return false;
}