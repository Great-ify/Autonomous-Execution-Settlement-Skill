import { ProviderUnavailableError, TransactionTimeoutError } from './errors';

export const isRetryableError = (error: any): boolean => {
  return error instanceof ProviderUnavailableError || error instanceof TransactionTimeoutError;
};

export async function executeRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error)) throw error;
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
