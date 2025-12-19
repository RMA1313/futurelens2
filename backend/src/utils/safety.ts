export async function withTimeout<T>(promise: Promise<T>, ms: number, message?: string): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(message ?? `عملیات پس از ${ms} میلی‌ثانیه متوقف شد`));
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutHandle));
}

export async function withRetries<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 200,
  onRetry?: (attempt: number, error: unknown) => void
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;
      if (onRetry) onRetry(attempt + 1, err);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    attempt += 1;
  }
  throw lastError;
}
