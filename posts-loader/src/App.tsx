import './App.css';
import { useEffect, useState } from 'react';
import { PostsManager } from '../libs/posts/PostManager.class.ts';
import { CacheService } from '../libs/services/cache.service.ts'; // Import CacheService
import { Post, Media, User } from '../entities/posts.types.ts';
import Like from "../icons/like.icon.tsx";
import moment from 'moment';

/**
 * App component that displays posts with media and user details.
 * Fetches and displays the next post every 6 seconds using PostsManager.
 */
function App() {
    // Create an instance of CacheService for Post and pass it to PostsManager
    const cacheService = new CacheService<{ posts: Post[], cursor: number }>('cachedPostsWithCursor');
    const [postsManager] = useState<PostsManager>(new PostsManager(cacheService));

    // State to hold the current post, media, user, loading status, and error
    const [currentPost, setCurrentPost] = useState<Post | null>(null);
    const [currentMedia, setCurrentMedia] = useState<Media | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetches the next post, media, and user details from the PostsManager.
     * Handles loading and error states appropriately.
     */
    const fetchNextPostWithDetails = async () => {
        setStatus('loading'); // Start loading

        try {
            const postDetails = await postsManager.getNextPostWithDetails(); // Fetch the post, media, and user
            if (postDetails) {
                setCurrentPost(postDetails.post);
                setCurrentMedia(postDetails.media);
                setCurrentUser(postDetails.user);
                setStatus('idle'); // Set status back to idle
                setError(null); // Clear previous errors
            } else {
                setError('No more posts available');
                setStatus('error'); // Set status to error
            }
        } catch (err) {
            setError('Failed to load post');
            setStatus('error');
            console.error('Error fetching post:', err);
        }
    };

    useEffect(() => {
        // Load the first post when the component mounts
        fetchNextPostWithDetails();

        // Set up an interval to fetch the next post every 6 seconds
        const interval = setInterval(() => {
            fetchNextPostWithDetails();
        }, 6000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, [postsManager]);

    /**
     * Conditional rendering based on the current status.
     */
    if (status === 'loading' && !currentPost) {
        return <div>Loading...</div>;
    }

    if (status === 'error') {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="post-container">
            {currentPost && currentMedia && currentUser ? (
                <>
                    <div className="post-media" style={{backgroundImage: `url(${currentMedia.urls.full})`}} />
                    <div className="post-description">
                        <div className="user-info">
                            <h2>{currentUser.first_name} {currentUser.last_name}</h2>
                            <img src={currentUser.profile_images.medium} alt={currentUser.username}
                                 className="profile-pic"/>
                        </div>
                        <div className="post-content">
                            <h1>{currentPost.title}</h1>
                            <p>{currentPost.description}</p>
                        </div>
                        <div className="post-footer">
                            <div className={'social-metrics'}><Like size={30} /><span style={{marginLeft: '.5rem'}}>{currentPost.likes} personnes</span></div>
                            <div>Posted on: {moment(currentPost.created).fromNow()}</div>
                        </div>
                    </div>
                </>
            ) : (
                <p>No post available</p>
            )}
        </div>
    );
}

export default App;
