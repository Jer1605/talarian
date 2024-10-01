import axios from 'axios';

/**
 * Performs a GET request using Axios and returns the response data.
 *
 * @param {string} url - The API URL to send the request to.
 * @returns {Promise<any>} - A promise that resolves to the data returned from the API.
 * @throws {Error} - Throws an error if the request fails.
 */
export async function apiGet(url: string): Promise<any> {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw new Error(error?.message || 'Unknown error occurred');
    }
}
