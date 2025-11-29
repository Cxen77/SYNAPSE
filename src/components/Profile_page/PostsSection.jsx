import React, { useState, useEffect } from 'react';
import { FaHeart, FaComment, FaShare, FaEllipsisH, FaRegHeart } from 'react-icons/fa';
import api from '../../api/axios';
import Avatar from '../common/Avatar';

const PostsSection = ({ isOwner, user }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [likedPosts, setLikedPosts] = useState({});

    useEffect(() => {
        if (user?._id) {
            fetchPosts();
        }
    }, [user?._id]);

    const fetchPosts = async () => {
        try {
            const res = await api.get(`/posts?userId=${user._id}`);
            setPosts(res.data.posts);

            // Initialize liked state
            // Note: In a real app, the backend should tell us if we liked it
            // For now, we'll just default to false as per existing logic
        } catch (err) {
            console.error("Failed to fetch user posts", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleLike = async (postId) => {
        try {
            await api.put(`/posts/${postId}/like`);
            setLikedPosts(prev => ({
                ...prev,
                [postId]: !prev[postId]
            }));
            // Ideally refetch or update local count
        } catch (err) {
            console.error("Failed to like post", err);
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
                    <div
                        key={post._id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
                    >
                        {/* Post Header */}
                        <div className="p-4 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar
                                    src={post.user?.profilePic || user.profilePic}
                                    alt={post.user?.name || user.name}
                                    size="md"
                                    className="object-cover"
                                />
                                <div>
                                    <h4 className="font-bold text-gray-900 hover:underline cursor-pointer">
                                        {post.user?.name || user.name}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition">
                                <FaEllipsisH className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Post Content */}
                        <div className="px-4 pb-3">
                            <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
                        </div>

                        {/* Post Image */}
                        {post.image && (
                            <div className="w-full">
                                <img
                                    src={post.image}
                                    alt="Post content"
                                    className="w-full object-cover max-h-96"
                                />
                            </div>
                        )}

                        {/* Post Stats */}
                        <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-600 border-t border-gray-200">
                            <div className="flex items-center gap-1">
                                <div className="flex -space-x-1">
                                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                        <FaHeart className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                                <span className="ml-1 hover:underline cursor-pointer">
                                    {post.likes?.length || 0} likes
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="hover:underline cursor-pointer">{post.comments?.length || 0} comments</span>
                                <span className="hover:underline cursor-pointer">0 shares</span>
                            </div>
                        </div>

                        {/* Post Actions */}
                        <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-around">
                            <button
                                onClick={() => toggleLike(post._id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-semibold ${likedPosts[post._id] ? 'text-blue-600' : 'text-gray-600'
                                    }`}
                            >
                                {likedPosts[post._id] ? (
                                    <FaHeart className="w-5 h-5" />
                                ) : (
                                    <FaRegHeart className="w-5 h-5" />
                                )}
                                Like
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition text-gray-600 font-semibold">
                                <FaComment className="w-5 h-5" />
                                Comment
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition text-gray-600 font-semibold">
                                <FaShare className="w-5 h-5" />
                                Share
                            </button>
                        </div>
                    </div>
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
