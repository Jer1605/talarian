export class CacheService<T> {
    private readonly cacheKey: string;

    constructor(cacheKey: string) {
        this.cacheKey = cacheKey;
    }

    /**
     * Retrieves cached data and cursor position from localStorage.
     *
     * @returns {T | null} - An object containing cached data, or null if not found.
     */
    getCachedData(): T | null {
        const cachedData = localStorage.getItem(this.cacheKey);
        return cachedData ? JSON.parse(cachedData) : null;
    }

    /**
     * Caches data and cursor position in localStorage.
     *
     * @param {T} data - The data to be cached.
     */
    cacheData(data: T): void {
        localStorage.setItem(this.cacheKey, JSON.stringify(data));
    }

    /**
     * Clears the cached data from localStorage.
     */
    clearCache(): void {
        localStorage.removeItem(this.cacheKey);
    }
}
