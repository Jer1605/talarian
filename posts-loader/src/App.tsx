import './App.css'
import { useEffect, useState } from "react";
import { PostsManager } from "../libs/posts/PostManager.class.ts";
import { Post } from "../libs/posts/posts.types.ts";

function App() {
    const [postsManager] = useState<PostsManager>(new PostsManager()); // Initialize directly
    const [currentPost, setCurrentPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Track loading state
    const [error, setError] = useState<string | null>(null); // Track error state

    // Fetch and set the next post
    const loadNextPost = async () => {
        setLoading(true); // Start loading
        const post = await postsManager.getNextPost();
        if (post) {
            setCurrentPost(post);
            setError(null); // Clear any previous errors
        } else {
            setError("Failed to load post");
        }
        setLoading(false); // End loading
    };

    useEffect(() => {
        // Initial post load
        loadNextPost();

        // Set interval to load the next post every 6 seconds
        const interval = setInterval(() => {
            loadNextPost();
        }, 6000); // 6 seconds interval

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, [postsManager]); // Re-run effect if `postsManager` changes

    if (loading && !currentPost) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            {currentPost ? (
                <div>
                    <h1>Post ID: {currentPost.id}</h1>
                    <p>Title: {currentPost.title}</p>
                    <p>Description: {currentPost.description}</p>
                    <p>Likes: {currentPost.likes}</p>
                </div>
            ) : (
                <p>No post available</p>
            )}
        </div>
    );
}

export default App;
