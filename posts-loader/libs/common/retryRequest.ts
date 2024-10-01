/**
 * Retries an asynchronous function a given number of times, with an optional delay.
 * Implements exponential backoff by increasing the delay with each retry.
 *
 * @template T
 * @param {() => Promise<T>} fn - The asynchronous function to retry.
 * @param {number} retries - The maximum number of retry attempts.
 * @param {number} [delay=1000] - The initial delay between retries in milliseconds.
 * @returns {Promise<T>} - A promise that resolves to the result of the function or throws after max retries.
 * @throws {Error} - Throws an error if all retry attempts fail.
 */
export async function retryRequest<T>(fn: () => Promise<T>, retries: number, delay: number = 1000): Promise<T> {
    try {
        // Attempt to run the provided function
        return await fn();
    } catch (error) {
        if (retries === 0) throw error; // No retries left, throw the error
        // Wait for the specified delay (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, delay));
        console.warn(`Retrying... attempts left: ${retries}`);
        // Retry the function with one less retry attempt and an increased delay
        return retryRequest(fn, retries - 1, delay * 2);
    }
}
