/**
 * HTTP utilities for timeout and retry functionality
 */

/**
 * Creates a fetch request with timeout support
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Implements exponential backoff retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  baseDelayMs: number
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain errors
      if (
        error instanceof Error &&
        "retryable" in error &&
        !(error as any).retryable
      ) {
        throw error;
      }

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delay = baseDelayMs * Math.pow(2, attempt);
      const jitter = Math.random() * 0.1 * delay; // Add up to 10% jitter
      const totalDelay = delay + jitter;

      console.warn(
        `Request failed (attempt ${attempt + 1}/${
          maxRetries + 1
        }). Retrying in ${Math.round(totalDelay)}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, totalDelay));
    }
  }

  throw lastError!;
}

/**
 * Adds a small delay between requests for rate limiting courtesy
 */
export async function rateLimitDelay(ms: number = 100): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
