import { apiGet } from '../services/api.service.ts';
import { retryRequest } from '../common/retryRequest.ts';
import { Post, ObjectResult, Media, User } from '../../entities/posts.types.ts';
import { CacheService } from '../services/cache.service.ts';

/**
 * Class responsible for managing posts.
 * Handles fetching posts from the API, retry logic, and caching.
 */
export class PostsManager {
    private posts: Post[] = [];
    private currentCursor: number = 0;
    private readonly limit: number = 15;
    private readonly maxRetries: number = 5;
    private readonly BASE_URL: string = 'https://apis.slstice.com/mock';
    private readonly API_KEY: string = 'ZSTYF0GBSSF0l3Ou6DTPE';

    /**
     * @constructor
     * @param {CacheService} cacheService - A service responsible for caching posts.
     */
    constructor(private cacheService: CacheService<{ posts: Post[], cursor: number }>) {
        // Try to load cached posts when the PostsManager is initialized
        const cachedData = this.cacheService.getCachedData();
        this.posts = cachedData?.posts || [];
        this.currentCursor = cachedData?.cursor || 0;
    }

    /**
     * Fetches more posts from the API.
     * Implements retry logic and caches posts after fetching.
     *
     * @param {number} postsNumber - The number of posts to fetch.
     * @returns {Promise<ObjectResult<Post[]>>} - A promise that resolves to the fetched posts or an error.
     */
    async fetchMorePosts(postsNumber: number): Promise<ObjectResult<Post[]>> {
        const requestFn = () => apiGet(`${this.BASE_URL}/posts?offset=${this.posts.length}&limit=${postsNumber}&api_key=${this.API_KEY}`);

        try {
            // Perform the API request with retry logic
            const data = await retryRequest(requestFn, this.maxRetries);

            // If the API does not return successful data or no posts, return an error
            if (!data.success || data.response.posts.length === 0) {
                return { error: 'No more posts available' };
            }

            // Append the newly fetched posts to the existing posts
            this.posts = [...this.posts, ...data.response.posts];

            // Cache the newly fetched posts
            this.cacheService.cacheData({ posts: this.posts, cursor: this.currentCursor });
            return { success: this.posts };
        } catch (error) {
            // Return an error if the max retries have been exhausted
            console.error("Error fetching posts after max retries:", error);
            return { error: error.message || 'Unknown error occurred' };
        }
    }

    /**
     * Fetches the media details for a given media ID.
     *
     * @param {string} mediaId - The ID of the media to fetch.
     * @returns {Promise<Media | null>} - The media details or null if an error occurs.
     */
    async fetchMedia(mediaId: string): Promise<Media | null> {
        try {
            const mediaUrl = `${this.BASE_URL}/medias/${mediaId}?api_key=${this.API_KEY}`;
            const mediaResponse = await apiGet(mediaUrl);
            if (mediaResponse.success) {
                return mediaResponse.response.media;
            }
            return null;
        } catch (error) {
            console.error("Error fetching media:", error);
            return null;
        }
    }

    /**
     * Fetches the user details for a given username.
     *
     * @param {string} username - The username of the user to fetch.
     * @returns {Promise<User | null>} - The user details or null if an error occurs.
     */
    async fetchUser(username: string): Promise<User | null> {
        try {
            const userUrl = `${this.BASE_URL}/users/${username}?api_key=${this.API_KEY}`;
            const userResponse = await apiGet(userUrl);
            if (userResponse.success) {
                return userResponse.response.user;
            }
            return null;
        } catch (error) {
            console.error("Error fetching user:", error);
            return null;
        }
    }

    /**
     * Retrieves the next post, its media, and user details.
     *
     * @returns {Promise<{ post: Post, media: Media, user: User } | null>} - Returns the post with its media and user details or null if there is an error.
     */
    async getNextPostWithDetails(): Promise<{ post: Post, media: Media, user: User } | null> {
        if (this.currentCursor >= this.posts.length || !this.posts.length) {
            const result = await this.fetchMorePosts(this.limit); // Fetch more posts
            if ('error' in result) {
                console.error("Error fetching more posts:", result.error);
                return null;
            }
        }

        const nextPost = this.posts[this.currentCursor];
        this.currentCursor++;

        // Fetch media and user details for the post
        const media = await this.fetchMedia(nextPost.mediaId);
        const user = await this.fetchUser(nextPost.user.username);

        if (!media || !user) {
            return null; // Return null if either media or user fetching failed
        }

        // Cache the updated posts and cursor
        this.cacheService.cacheData({ posts: this.posts, cursor: this.currentCursor });

        return { post: nextPost, media, user };
    }
}
