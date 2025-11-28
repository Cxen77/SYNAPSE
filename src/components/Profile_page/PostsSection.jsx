import React, { useState } from 'react';
import userData from '../userdata';
import { FaHeart, FaComment, FaShare, FaEllipsisH, FaRegHeart } from 'react-icons/fa';

const PostsSection = ({ isOwner }) => {
    const [likedPosts, setLikedPosts] = useState({});

    const toggleLike = (postId) => {
        setLikedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    return (
        <div className="space-y-4">
            {/* Create Post Card - Only visible to owner */}
            {isOwner && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <img
                                src={userData.profilePic}
                                alt={userData.name}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <button className="flex-1 text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition">
                                What's on your mind, {userData.name.split(' ')[0]}?
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Posts Feed */}
            {userData.posts.map((post) => (
                <div
                    key={post.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
                >
                    {/* Post Header */}
                    <div className="p-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src={userData.profilePic}
                                alt={userData.name}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                                <h4 className="font-bold text-gray-900 hover:underline cursor-pointer">
                                    {userData.name}
                                </h4>
                                <p className="text-sm text-gray-500">{post.time}</p>
                            </div>
                        </div>
                        <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition">
                            <FaEllipsisH className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Post Content */}
                    <div className="px-4 pb-3">
                        <p className="text-gray-900 whitespace-pre-wrap">{post.text}</p>
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
                                {likedPosts[post.id] ? '125' : '124'} likes
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="hover:underline cursor-pointer">23 comments</span>
                            <span className="hover:underline cursor-pointer">5 shares</span>
                        </div>
                    </div>

                    {/* Post Actions */}
                    <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-around">
                        <button
                            onClick={() => toggleLike(post.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-semibold ${likedPosts[post.id] ? 'text-blue-600' : 'text-gray-600'
                                }`}
                        >
                            {likedPosts[post.id] ? (
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
            ))}

            {/* Load More */}
            <div className="text-center py-4">
                <button className="px-6 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-semibold">
                    Load More Posts
                </button>
            </div>
        </div>
    );
};

export default PostsSection;
