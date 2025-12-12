import React from 'react';
import { HiHandThumbUp, HiOutlineHandThumbUp, HiHandThumbDown, HiOutlineHandThumbDown, HiChatBubbleLeft, HiShare, HiEllipsisHorizontal } from 'react-icons/hi2';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Avatar from '../common/Avatar';

const ForumPostCard = ({ post, onVote }) => {
    const { currentUser } = useAuth();
    const isLiked = post.likes.includes(currentUser?._id);
    const isDisliked = post.dislikes.includes(currentUser?._id);
    const voteCount = post.likes.length - post.dislikes.length;

    const handleLike = async (e) => {
        e.stopPropagation();
        try {
            const { data } = await api.put(`/forums/posts/${post._id}/like`);
            onVote(data);
        } catch (error) {
            console.error("Failed to like post", error);
            toast.error("Failed to like post");
        }
    };

    const handleDislike = async (e) => {
        e.stopPropagation();
        try {
            const { data } = await api.put(`/forums/posts/${post._id}/dislike`);
            onVote(data);
        } catch (error) {
            console.error("Failed to dislike post", error);
            toast.error("Failed to dislike post");
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 overflow-hidden cursor-pointer group relative">
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-blue-50/30 group-hover:via-purple-50/30 group-hover:to-pink-50/30 transition-all duration-500 pointer-events-none"></div>

            {/* Header */}
            <div className="p-5 flex items-start gap-4 relative z-10">
                <Link to={`/profile/${post.author?.username}`} className="flex-shrink-0">
                    <Avatar
                        src={post.author?.profilePic}
                        alt={post.author?.name}
                        size="md"
                        className="ring-2 ring-gray-50 group-hover:ring-blue-100 transition-all duration-300"
                    />
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link to={`/profile/${post.author?.username}`} className="font-bold text-gray-900 hover:text-blue-600 transition truncate text-base">
                            {post.author?.name}
                        </Link>
                        {post.forum && (
                            <>
                                <span className="text-gray-300">•</span>
                                <Link to={`/forums/${post.forum._id}`} className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1.5 truncate bg-blue-50 px-2 py-0.5 rounded-full">
                                    {post.forum.icon && <img src={post.forum.icon} alt="" className="w-3.5 h-3.5 rounded-full" />}
                                    r/{post.forum.name}
                                </Link>
                            </>
                        )}
                        <span className="text-gray-300">•</span>
                        <span className="text-xs font-medium text-gray-500">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </span>
                    </div>

                    {/* Content Preview */}
                    <div className="mt-3">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-700 transition-colors">{post.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">{post.content}</p>

                        {post.image && (
                            <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 max-h-[400px] flex justify-center mb-4 shadow-inner">
                                <img src={post.image} alt="Post content" className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-500" />
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between border-t border-gray-100 mt-4 pt-2">
                        {/* Like Button */}
                        <button
                            onClick={handleLike}
                            className={`flex flex-1 items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${isLiked ? 'text-orange-500 bg-orange-50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                        >
                            {isLiked ? <HiHandThumbUp className="w-5 h-5" /> : <HiOutlineHandThumbUp className="w-5 h-5" />}
                            <span>{post.likes.length}</span>
                        </button>

                        {/* Dislike Button */}
                        <button
                            onClick={handleDislike}
                            className={`flex flex-1 items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${isDisliked ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                        >
                            {isDisliked ? <HiHandThumbDown className="w-5 h-5" /> : <HiOutlineHandThumbDown className="w-5 h-5" />}
                        </button>

                        {/* Comment Button */}
                        <button className="flex flex-1 items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200">
                            <HiChatBubbleLeft className="w-5 h-5" />
                            <span>{post.repliesCount || 0}</span>
                        </button>

                        {/* Share Button */}
                        <button className="flex flex-1 items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200">
                            <HiShare className="w-5 h-5" />
                            <span>Share</span>
                        </button>
                    </div>
                </div>

                <button className="text-gray-300 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition">
                    <HiEllipsisHorizontal className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default ForumPostCard;
