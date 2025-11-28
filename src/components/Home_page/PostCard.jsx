import React, { useState, useRef } from "react";
import { FaRegThumbsUp, FaThumbsUp, FaRegCommentDots, FaShare, FaEllipsisH, FaPaperPlane } from "react-icons/fa";
import api from "../../api/axios";

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(false); // Ideally this should be checked against current user ID
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const inputRef = useRef(null);

  const handleReply = (username) => {
    setNewComment(`@${username} `);
    inputRef.current?.focus();
  };

  // Check if current user liked the post (requires current user ID, skipping for now or assuming false initially)
  // In a real app, we'd check if post.likes array includes current user ID. 
  // Since we only get count, we can't know for sure without more data.
  // For this fix, we'll just toggle local state.

  const handleLike = async () => {
    try {
      // Optimistic update
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);

      await api.put(`/posts/${post.id}/like`);
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
      const { data } = await api.post(`/posts/${post.id}/comments`, { text: newComment });
      setComments(data); // Backend returns updated comments array
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out this post on Synapse: ${window.location.origin}/post/${post.id}`);
    alert("Link copied to clipboard!");
  };

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="flex gap-4">
          <img
            src={post.avatar || `https://ui-avatars.com/api/?name=${post.author}&background=random`}
            alt="author"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-50"
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition">{post.author}</h4>
                <p className="text-xs text-gray-500">{post.role} • {post.time}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition">
                <FaEllipsisH />
              </button>
            </div>

            <p className="mt-3 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{post.text}</p>

            {post.image && (
              <div className="mt-3 rounded-xl overflow-hidden border border-gray-100">
                <img src={post.image} alt="post" className="w-full object-cover max-h-[500px]" />
              </div>
            )}

            {/* Stats Row */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="bg-blue-100 p-1 rounded-full">
                  <FaThumbsUp className="text-blue-600 w-2 h-2" />
                </div>
                <span>{likeCount} likes</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowComments(!showComments)} className="hover:underline">
                  {comments.length} comments
                </button>
                <button onClick={handleShare} className="hover:underline">
                  Share
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1 mt-2">
              <button
                onClick={handleLike}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${liked ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {liked ? <FaThumbsUp /> : <FaRegThumbsUp />} Like
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                <FaRegCommentDots /> Comment
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                <FaShare /> Share
              </button>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {comments.map((comment, index) => (
                    <div key={index} className="flex gap-2 group">
                      <img
                        src={comment.user?.profilePic || `https://ui-avatars.com/api/?name=${comment.user?.name || 'User'}&background=random`}
                        alt="commenter"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block min-w-[150px]">
                          <h5 className="font-bold text-xs text-gray-900 hover:underline cursor-pointer">
                            {comment.user?.name || 'Unknown User'}
                          </h5>
                          <p className="text-sm text-gray-800 leading-snug">{comment.text}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-1 ml-2 text-xs text-gray-500 font-medium">
                          <button className="hover:text-blue-600 hover:underline">Like</button>
                          <button
                            onClick={() => handleReply(comment.user?.name)}
                            className="hover:text-blue-600 hover:underline"
                          >
                            Reply
                          </button>
                          <span>{new Date(comment.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 items-start pt-2">
                  <img
                    src={`https://ui-avatars.com/api/?name=You&background=random`}
                    alt="current user"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <form onSubmit={handleCommentSubmit} className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full bg-gray-100 border-transparent focus:bg-white border focus:border-blue-500 rounded-2xl px-4 py-2.5 pr-10 text-sm focus:outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submittingComment}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaPaperPlane size={14} />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
