import React, { useState, useRef } from "react";
import PropTypes from 'prop-types';
import { HiThumbUp, HiOutlineThumbUp, HiChatAlt, HiShare, HiDotsHorizontal, HiPaperAirplane, HiTrash } from "react-icons/hi";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Avatar from "../common/Avatar";
import useIsMobile from "../../hooks/useIsMobile";
import MobileCommentsSheet from "./MobileCommentsSheet";
import CommentItem from "./CommentItem";

export default function PostCard({ post, currentUser = {}, onDelete }) {
  const isMobile = useIsMobile();

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

    // Focus appropriate input
    if (isMobile) {
      // Mobile sheet handles focus internally via prop/effect
    } else {
      inputRef.current?.focus();
    }
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
    const url = `${window.location.origin}/post/${displayPost.id}`;
    if (navigator.share) {
      navigator.share({
        title: `Post by ${displayPost.author}`,
        text: `Check out this post on Synapse!`,
        url: url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
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
      {isMobile ? (
        <MobileCommentsSheet
          isOpen={showComments}
          onClose={() => setShowComments(false)}
          comments={comments}
          currentUser={currentUser}
          onReply={handleReply}
          onSubmit={handleCommentSubmit}
          newComment={newComment}
          setNewComment={setNewComment}
          replyingTo={replyingTo}
          cancelReply={cancelReply}
          submitting={submittingComment}
        />
      ) : (
        /* Desktop Inline Comments */
        showComments && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-6 mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {comments.map((comment, index) => (
                <CommentItem
                  key={index}
                  comment={comment}
                  onReply={handleReply}
                  currentUser={currentUser}
                />
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
        )
      )}
    </article>
  );
}

PostCard.propTypes = {
  post: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
  onDelete: PropTypes.func
};
