import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiHeart, HiChatBubbleLeft, HiShare, HiEllipsisHorizontal, HiFlag, HiBookmark } from 'react-icons/hi2';
import api from '../../api/axios';
import Avatar from '../common/Avatar';
import RichTextEditor from '../common/RichTextEditor';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ThreadPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [post, setPost] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null); // ID of reply being replied to

    useEffect(() => {
        fetchPostDetails();
    }, [id]);

    const fetchPostDetails = async () => {
        try {
            const res = await api.get(`/forums/post/${id}`);
            setPost(res.data.post);
            setReplies(res.data.replies);
        } catch (error) {
            console.error("Failed to fetch post", error);
            toast.error("Failed to load discussion");
            navigate('/forums');
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (type) => {
        if (!currentUser) return toast.error("Please login to vote");
        try {
            const res = await api.put(`/forums/posts/${id}/${type === 'up' ? 'like' : 'dislike'}`);
            setPost(res.data);
        } catch (error) {
            toast.error("Failed to vote");
        }
    };

    const handleReplyVote = async (replyId, type) => {
        if (!currentUser) return toast.error("Please login to vote");
        try {
            const res = await api.put(`/forums/replies/${replyId}/${type === 'up' ? 'like' : 'dislike'}`);
            setReplies(prev => prev.map(r => r._id === replyId ? res.data : r));
        } catch (error) {
            toast.error("Failed to vote");
        }
    };

    const handleSave = async () => {
        if (!currentUser) return toast.error("Please login to save");
        try {
            const res = await api.put(`/forums/posts/${id}/save`);
            if (res.data.saved) {
                toast.success("Post saved");
            } else {
                toast.success("Post unsaved");
            }
        } catch (error) {
            toast.error("Failed to save post");
        }
    };

    const handleReport = async () => {
        if (!currentUser) return toast.error("Please login to report");
        const reason = prompt("Reason for reporting:");
        if (!reason) return;
        try {
            await api.post(`/forums/posts/${id}/report`, { reason });
            toast.success("Report submitted");
        } catch (error) {
            toast.error("Failed to submit report");
        }
    };

    const handleSubmitReply = async () => {
        if (!replyContent.trim()) return;
        setSubmitting(true);
        try {
            const res = await api.post(`/forums/post/${id}/reply`, {
                content: replyContent,
                parentReplyId: replyingTo
            });

            // Refresh replies or append locally
            // Ideally we should fetch fresh to get populated data, but let's try to append if simple
            // The backend returns populated reply, so we can append
            setReplies(prev => [...prev, res.data]);
            setReplyContent('');
            setReplyingTo(null);
            toast.success("Reply posted");
        } catch (error) {
            toast.error("Failed to post reply");
        } finally {
            setSubmitting(false);
        }
    };

    // Helper to render nested replies
    const renderReplies = (parentId = null, depth = 0) => {
        const currentLevelReplies = replies.filter(r =>
            (parentId === null && !r.parentReply) ||
            (r.parentReply === parentId) ||
            (r.parentReply?._id === parentId) // Handle populated vs unpopulated
        );

        if (currentLevelReplies.length === 0) return null;

        return (
            <div className={`space-y-4 ${depth > 0 ? 'ml-8 pl-4 border-l-2 border-gray-100' : ''}`}>
                {currentLevelReplies.map(reply => (
                    <div key={reply._id} className="bg-transparent">
                        <div className="flex gap-3">
                            <Avatar src={reply.author?.profilePic} alt={reply.author?.name} size="sm" />
                            <div className="flex-1">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900 text-sm">{reply.author?.name}</span>
                                            <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}</span>
                                        </div>
                                    </div>
                                    <div className="text-gray-800 text-sm whitespace-pre-wrap mb-3">
                                        {reply.content}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1 shadow-sm border border-gray-100">
                                            <button
                                                onClick={() => handleReplyVote(reply._id, 'up')}
                                                className={`p-1 rounded hover:bg-gray-100 ${reply.likes?.includes(currentUser?._id) ? 'text-orange-500' : 'text-gray-400'}`}
                                            >
                                                <HiHeart className="w-4 h-4" />
                                            </button>
                                            <span className="text-xs font-bold text-gray-600">
                                                {(reply.likes?.length || 0) - (reply.dislikes?.length || 0)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setReplyingTo(replyingTo === reply._id ? null : reply._id)}
                                            className="text-xs font-bold text-gray-500 hover:text-gray-900"
                                        >
                                            Reply
                                        </button>
                                    </div>
                                </div>

                                {/* Reply Input for this comment */}
                                {replyingTo === reply._id && (
                                    <div className="mt-3 ml-4">
                                        <RichTextEditor
                                            value={replyContent}
                                            onChange={setReplyContent}
                                            placeholder={`Replying to ${reply.author?.name}...`}
                                            minHeight="min-h-[100px]"
                                        />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button
                                                onClick={() => setReplyingTo(null)}
                                                className="px-3 py-1.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSubmitReply}
                                                disabled={submitting}
                                                className="px-4 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                                            >
                                                {submitting ? 'Posting...' : 'Reply'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Nested Replies */}
                                {renderReplies(reply._id, depth + 1)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!post) return null;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Back Nav */}
            <div className="mb-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition">
                    <HiArrowLeft className="w-5 h-5" />
                    Back to Feed
                </button>
            </div>

            {/* Main Post */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                {/* Vote Sidebar (Desktop) */}
                <div className="flex">
                    <div className="hidden md:flex flex-col items-center gap-1 p-4 bg-gray-50 border-r border-gray-100 w-16">
                        <button
                            onClick={() => handleVote('up')}
                            className={`p-2 rounded-lg hover:bg-gray-200 transition ${post.likes?.includes(currentUser?._id) ? 'text-orange-500 bg-orange-50' : 'text-gray-400'}`}
                        >
                            <HiHeart className="w-6 h-6" />
                        </button>
                        <span className="font-bold text-gray-900 text-lg">
                            {(post.likes?.length || 0) - (post.dislikes?.length || 0)}
                        </span>
                    </div>

                    <div className="flex-1 p-6">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <Link to={`/forums/${post.forum?._id}`} className="flex items-center gap-2 group">
                                {post.forum?.icon && <img src={post.forum.icon} alt="" className="w-6 h-6 rounded-md" />}
                                <span className="font-bold text-gray-900 text-sm group-hover:underline">r/{post.forum?.name}</span>
                            </Link>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500 text-sm">Posted by u/{post.author?.name}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500 text-sm">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                        </div>

                        {/* Content */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

                        {post.tags && post.tags.length > 0 && (
                            <div className="flex gap-2 mb-4">
                                {post.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="prose max-w-none text-gray-800 mb-6">
                            {post.content}
                        </div>

                        {post.image && (
                            <div className="mb-6 rounded-xl overflow-hidden border border-gray-100">
                                <img src={post.image} alt="" className="w-full object-cover max-h-[500px]" />
                            </div>
                        )}

                        {/* Mobile Actions */}
                        <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                            <div className="flex md:hidden items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                                <button onClick={() => handleVote('up')} className={`${post.likes?.includes(currentUser?._id) ? 'text-orange-500' : 'text-gray-500'}`}>
                                    <HiHeart className="w-5 h-5" />
                                </button>
                                <span className="font-bold text-sm">{(post.likes?.length || 0) - (post.dislikes?.length || 0)}</span>
                            </div>

                            <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm transition">
                                <HiChatBubbleLeft className="w-5 h-5" />
                                {replies.length} Comments
                            </button>
                            <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm transition">
                                <HiShare className="w-5 h-5" />
                                Share
                            </button>
                            <button onClick={handleSave} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm transition">
                                <HiBookmark className="w-5 h-5" />
                                Save
                            </button>
                            <div className="flex-1"></div>
                            <button onClick={handleReport} className="text-gray-400 hover:text-red-600 transition" title="Report">
                                <HiFlag className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comment Section */}
            <div className="bg-gray-50/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Discussion</h3>

                {/* Comment Input */}
                <div className="mb-8 flex gap-4">
                    <div className="hidden md:block">
                        <Avatar src={currentUser?.profilePic} alt={currentUser?.name} size="md" />
                    </div>
                    <div className="flex-1">
                        <RichTextEditor
                            value={replyingTo ? '' : replyContent} // Clear if replying to someone else
                            onChange={(val) => {
                                setReplyingTo(null);
                                setReplyContent(val);
                            }}
                            placeholder="What are your thoughts?"
                        />
                        <div className="flex justify-end mt-3">
                            <button
                                onClick={handleSubmitReply}
                                disabled={submitting || (!replyingTo && !replyContent.trim())}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition disabled:opacity-50 shadow-sm"
                            >
                                {submitting ? 'Posting...' : 'Post Comment'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Comments List */}
                <div className="space-y-6">
                    {renderReplies(null)}
                </div>
            </div>
        </div>
    );
};

export default ThreadPage;
