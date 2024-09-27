import axios from "axios";
import {PostManager, Post, ObjectResult, User, Media} from "./posts.types";

export class PostsManager implements PostManager
{
    public posts: Post[] = [];
    protected currentCursor: number = 0;
    private limit: number = 2;
    private BASE_URL: string = 'https://apis.slstice.com/mock';
    private API_KEY: string = 'ZSTYF0GBSSF0l3Ou6DTPE';

    async fetchMorePosts(postsNumber: number) : Promise<ObjectResult<Post[]>>
    {
        try
        {
            const { data } = await axios.get(`${this.BASE_URL}/posts?offset=${this.currentCursor}&limit=${postsNumber}&api_key=${this.API_KEY}`);
            if(!data.success) return {error: data.response.message}

            this.posts = [...this.posts, ...data.response.posts];
            return {success: this.posts};
        }
        catch (error)
        {
            console.error("Error fetching posts:", error);
            return {error};
        }
    }

    async getNextPost() : Promise<Post>
    {
        if(!this.posts[this.currentCursor])
            await this.fetchMorePosts(this.limit);

        const currentPost = this.posts[this.currentCursor];
        this.currentCursor++;
        return currentPost;
    }

    async getMediaFromId(mediaId: Media['id']) : Promise<ObjectResult<Media>>
    {
        try
        {
            const {data} = await axios.get(`${this.BASE_URL}/media/${mediaId}`);
            if(!data.success) return {error: data.response.message}
            return data.response.media;
        }
        catch (error)
        {
            console.error("Error fetching media:", error);
            return {error};
        }
    }

    async getUserFromName(username: User['username']) : Promise<ObjectResult<User>>
    {
        try
        {
            const {data} = await axios.get(`${this.BASE_URL}/users/${username}`);
            if(!data.success) return {error: data.response.message}
            return data.response.user;
        }
        catch (error)
        {
            console.error("Error fetching user:", error);
            return {error};
        }
    }
}