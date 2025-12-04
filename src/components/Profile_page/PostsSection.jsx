import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Avatar from '../common/Avatar';
import PostCard from '../Home_page/PostCard';
import toast from 'react-hot-toast';

const PostsSection = ({ isOwner, user, currentUser }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?._id) {
            fetchPosts();
        }
    }, [user?._id]);

    const fetchPosts = async () => {
        try {
            const res = await api.get(`/posts?userId=${user._id}`);
            setPosts(res.data.posts);
        } catch (err) {
            console.error("Failed to fetch user posts", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;

        try {
            await api.delete(`/posts/${postId}`);
            setPosts(prev => prev.filter(p => p._id !== postId));
            toast.success("Post deleted successfully");
        } catch (err) {
            console.error("Failed to delete post", err);
            toast.error("Failed to delete post");
        }
    };

    if (loading) {
        return <div className="text-center py-4 text-gray-500">Loading posts...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Create Post Card - Only visible to owner */}
            {isOwner && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <Avatar
                                src={user.profilePic}
                                alt={user.name}
                                size="md"
                                className="object-cover"
                            />
                            <button className="flex-1 text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition">
                                What's on your mind, {user.name.split(' ')[0]}?
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Posts Feed */}
            {posts.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl border border-gray-200 text-gray-500">
                    No posts yet.
                </div>
            ) : (
                posts.map((post) => (
                    <PostCard
                        key={post._id}
                        post={post}
                        currentUser={currentUser}
                        onDelete={handleDeletePost}
                    />
                ))
            )}

            {/* Load More */}
            {posts.length > 0 && (
                <div className="text-center py-4">
                    <button className="px-6 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-semibold">
                        Load More Posts
                    </button>
                </div>
            )}
        </div>
    );
};

export default PostsSection;
