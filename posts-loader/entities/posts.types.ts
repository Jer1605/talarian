export interface PostManager {
    fetchMorePosts(postsNumber: number): Promise<ObjectResult<Post[]>>;
}

export type ObjectResult<T> = SuccessResult<T> | ErrorResult;
type SuccessResult<T> = { success: T }
type ErrorResult<T = Error | string> = { error: T }

export type Media = {
    id: string;
    type: string; // Assuming "image", but could be extended to other types if needed
    statistics: {
        views: number;
        downloads: number;
        likes: number;
        created: number; // Assuming this is a Unix timestamp
    };
    urls: {
        raw: string;
        full: string;
        regular: string;
        small: string;
    };
    owner: {
        id: string;
        username: string;
    };
};

export type User = {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    profile_images: {
        small: string;
        medium: string;
        large: string;
    };
};

export type Post = {
    id: string;
    created: string; // ISO date string
    mediaId: string;
    user: User;
    likes: number;
    title: string;
    description: string;
};