import React, { useState, useRef } from "react";
import { HiThumbUp, HiOutlineThumbUp, HiChatAlt, HiShare, HiDotsHorizontal, HiPaperAirplane, HiTrash } from "react-icons/hi";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Avatar from "../common/Avatar";

export default function PostCard({ post, currentUser, onDelete }) {
  // Normalize data to handle both frontend mock and backend data formats
  const displayPost = {
    id: post.id || post._id,
    author: post.author || post.user?.name || "Unknown User",
    username: post.username || post.user?.username || "user",
    avatar: post.avatar || post.user?.profilePic,
    role: post.role || (post.user?.course ? `${post.user.course} Student` : "Member"),
    time: post.time || (post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Just now"),
    text: post.text || post.content,
    image: post.image,
    likesCount: Array.isArray(post.likes) ? post.likes.length : (post.likes || 0),
    commentsCount: Array.isArray(post.comments) ? post.comments.length : (post.comments || 0),
    isLiked: Array.isArray(post.likes) ? post.likes.includes(currentUser?._id) : false,
    userId: post.user?._id || post.user // Store user ID for ownership check
  };

  const isOwner = (currentUser?._id && currentUser._id === displayPost.userId) ||
    (currentUser?.username && currentUser.username === displayPost.username);

  const [liked, setLiked] = useState(displayPost.isLiked);
  const [likeCount, setLikeCount] = useState(displayPost.likesCount);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { id: string, username: string }
  const inputRef = useRef(null);

  const handleReply = (commentId, username) => {
    setReplyingTo({ id: commentId, username });
    setNewComment(`@${username} `);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setNewComment("");
  };

  const handleLike = async () => {
    try {
      // Optimistic update
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);

      await api.put(`/posts/${displayPost.id}/like`);
    } catch (err) {
      console.error("Failed to like post", err);
      // Revert on error
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      let updatedComments;
      if (replyingTo) {
        const { data } = await api.post(`/posts/${displayPost.id}/comments/${replyingTo.id}/replies`, { text: newComment });
        updatedComments = data;
      } else {
        const { data } = await api.post(`/posts/${displayPost.id}/comments`, { text: newComment });
        updatedComments = data;
      }

      setComments(updatedComments);
      setNewComment("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Failed to add comment/reply", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out this post on Synapse: ${window.location.origin}/post/${displayPost.id}`);
    alert("Link copied to clipboard!");
  };

  // Helper to check if a comment mentions the current user
  const isMentioningMe = (text) => {
    if (!currentUser?.username) return false;
    return text.includes(`@${currentUser.username}`);
  };

  const CommentItem = ({ comment, isReply = false, parentId = null }) => {
    const isMention = isMentioningMe(comment.text);
    const [showReplies, setShowReplies] = useState(false);
    const hasReplies = !isReply && comment.replies && comment.replies.length > 0;

    return (
      <div className={`flex gap-3 group ${isReply ? 'mt-3' : ''}`}>
        <div className="flex-shrink-0 flex flex-col items-center">
          <Avatar
            src={comment.user?.profilePic}
            alt={comment.user?.name || 'User'}
            size={isReply ? "xs" : "sm"}
            className="mt-1"
          />
          {hasReplies && showReplies && (
            <div className="w-0.5 flex-1 bg-gray-200 my-1 rounded-full group-hover:bg-gray-300 transition-colors"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className={`rounded-2xl px-3 py-2 inline-block ${isMention ? 'bg-blue-50 border border-blue-100' : 'bg-gray-100'}`}>
            <h5 className="font-bold text-xs text-gray-900 hover:underline cursor-pointer">
              {comment.user?.name || 'Unknown User'}
            </h5>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {comment.text.split(' ').map((word, i) => (
                word.startsWith('@') ? <span key={i} className="text-blue-600 font-medium">{word} </span> : word + ' '
              ))}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-1 ml-1 text-xs text-gray-500 font-medium">
            <span>{new Date(comment.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <button className="hover:text-blue-600 transition">Like</button>
            <button
              onClick={() => handleReply(parentId || comment._id, comment.user?.username || 'user')}
              className="hover:text-blue-600 transition"
            >
              Reply
            </button>
          </div>

          {/* View Replies Toggle */}
          {hasReplies && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-xs text-gray-500 font-semibold mt-2 ml-1 hover:underline flex items-center gap-2"
            >
              <div className="w-6 h-[1px] bg-gray-300"></div>
              {showReplies ? "Hide replies" : `View ${comment.replies.length} more replies`}
            </button>
          )}

          {/* Render Replies */}
          {hasReplies && showReplies && (
            <div className="mt-2">
              {comment.replies.map((reply, idx) => (
                <CommentItem key={idx} comment={reply} isReply={true} parentId={comment._id} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <Link to={`/profile/${displayPost.username}`}>
          <Avatar
            src={displayPost.avatar}
            alt={displayPost.author}
            size="md"
            className="ring-2 ring-white shadow-sm transition-transform hover:scale-105"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${displayPost.username}`}>
            <h4 className="font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition truncate text-sm md:text-base">
              {displayPost.author}
            </h4>
          </Link>
          <p className="text-xs text-gray-500 truncate">
            {displayPost.role} • {displayPost.time}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition"
          >
            <HiDotsHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-10 animate-in fade-in zoom-in-95 duration-200">
              {isOwner && onDelete ? (
                <button
                  onClick={() => {
                    onDelete(displayPost.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                >
                  <HiTrash className="w-4 h-4" />
                  Delete Post
                </button>
              ) : (
                <button
                  onClick={() => {
                    // Handle report logic here
                    alert("Reported post");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Report Post
                </button>
              )}
              <button
                onClick={() => {
                  handleShare();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Copy Link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close menu when clicking outside */}
      {showMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)}></div>
      )}

      {/* Body Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{displayPost.text}</p>
      </div>

      {/* Image Attachment */}
      {displayPost.image && (
        <div className="w-full bg-gray-50 border-y border-gray-100">
          <img
            src={displayPost.image}
            alt="post"
            className="w-full h-auto max-h-[500px] object-contain mx-auto"
          />
        </div>
      )}

      {/* Stats Row */}
      <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500 border-b border-gray-50">
        <div className="flex items-center gap-1.5">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-1 rounded-full shadow-sm text-white">
            <HiThumbUp className="w-2.5 h-2.5" />
          </div>
          <span className="font-medium">{likeCount} likes</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowComments(!showComments)} className="hover:text-blue-600 transition font-medium">
            {comments.length} comments
          </button>
          <button onClick={handleShare} className="hover:text-blue-600 transition font-medium">
            Share
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-2 py-2 flex items-center justify-between gap-2">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${liked ? 'text-blue-600 bg-blue-50/50' : 'text-gray-600 hover:bg-gray-50'
            }`}
        >
          {liked ? <HiThumbUp className="w-5 h-5" /> : <HiOutlineThumbUp className="w-5 h-5" />}
          Like
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all duration-200"
        >
          <HiChatAlt className="w-5 h-5" />
          Comment
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all duration-200"
        >
          <HiShare className="w-5 h-5" />
          Share
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-6 mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {comments.map((comment, index) => (
              <CommentItem key={index} comment={comment} />
            ))}
          </div>

          <div className="flex gap-3 items-start pt-2 border-t border-gray-100">
            <Avatar
              src={currentUser?.profilePic}
              alt="You"
              size="sm"
              className="flex-shrink-0"
            />
            <div className="flex-1">
              {replyingTo && (
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1 ml-1">
                  <span>Replying to <span className="font-bold text-blue-600">@{replyingTo.username}</span></span>
                  <button onClick={cancelReply} className="hover:text-red-500">Cancel</button>
                </div>
              )}
              <form onSubmit={handleCommentSubmit} className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                  className={`w-full bg-gray-100 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none transition-all ${replyingTo ? 'ring-2 ring-blue-100' : ''}`}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submittingComment}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiPaperAirplane size={16} className="rotate-90" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
