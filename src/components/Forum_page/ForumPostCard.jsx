import React from 'react';
import { HiThumbUp, HiOutlineThumbUp, HiThumbDown, HiOutlineThumbDown, HiChatAlt, HiShare, HiDotsHorizontal } from 'react-icons/hi';
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer">
            {/* Header */}
            <div className="p-4 flex items-center gap-3">
                <Link to={`/profile/${post.author?.username}`}>
                    <Avatar
                        src={post.author?.profilePic}
                        alt={post.author?.name}
                        size="md"
                        className="ring-2 ring-gray-50 hover:opacity-90 transition"
                    />
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <Link to={`/profile/${post.author?.username}`} className="font-bold text-gray-900 hover:text-blue-600 transition truncate">
                            {post.author?.name}
                        </Link>
                        {post.forum && (
                            <>
                                <span className="text-gray-400">•</span>
                                <Link to={`/forums/${post.forum._id}`} className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1 truncate">
                                    {post.forum.icon && <img src={post.forum.icon} alt="" className="w-4 h-4 rounded-full" />}
                                    r/{post.forum.name}
                                </Link>
                            </>
                        )}
                    </div>
                    <p className="text-xs text-gray-500">
                        @{post.author?.username} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition">
                    <HiDotsHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">{post.title}</h3>
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap mb-3">{post.content}</p>

                {post.image && (
                    <div className="rounded-lg overflow-hidden border border-gray-100 bg-gray-50 max-h-[500px] flex justify-center mb-3">
                        <img src={post.image} alt="Post content" className="max-w-full max-h-full object-contain" />
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="px-2 py-1 flex gap-1 border-t border-gray-100">
                {/* Like Button */}
                <button
                    onClick={handleLike}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${isLiked ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    {isLiked ? <HiThumbUp className="w-5 h-5" /> : <HiOutlineThumbUp className="w-5 h-5" />}
                    <span>{post.likes.length}</span>
                </button>

                {/* Dislike Button */}
                <button
                    onClick={handleDislike}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${isDisliked ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    {isDisliked ? <HiThumbDown className="w-5 h-5" /> : <HiOutlineThumbDown className="w-5 h-5" />}
                </button>

                {/* Comment Button */}
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                    <HiChatAlt className="w-5 h-5" />
                    <span>{post.comments.length}</span>
                </button>

                {/* Share Button */}
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                    <HiShare className="w-5 h-5" />
                    <span>Share</span>
                </button>
            </div>
        </div>
    );
};

export default ForumPostCard;
