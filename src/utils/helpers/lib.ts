/**
 * Pauses execution for a specified duration (in milliseconds).
 * This function is useful for introducing delays in asynchronous operations or controlling flow in time-sensitive scenarios.
 *
 * @param duration - The duration (in milliseconds) to wait before resolving the promise.
 * @returns A promise that resolves after the specified duration.
 */
export async function sleep(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}
