import React, { useState } from "react";
import { FaImage, FaVideo, FaSmile } from "react-icons/fa";

export default function FeedHeader({ feedType, setFeedType, onCreatePost }) {
  const [text, setText] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [expanded, setExpanded] = useState(false);

  function submitPost() {
    if (!text.trim() && !imgUrl.trim()) return;
    onCreatePost({
      author: "You",
      role: "Student • Synapse",
      time: "Just now",
      text,
      image: imgUrl,
      likes: 0,
      comments: 0,
    });
    setText("");
    setImgUrl("");
    setExpanded(false);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
      {/* Feed Toggle - Moved to Top */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Create Post</h3>
        <div className="bg-gray-100 rounded-lg overflow-hidden flex text-sm border border-gray-200">
          <button
            onClick={() => setFeedType("For You")}
            className={`px-4 py-1.5 font-semibold transition ${
              feedType === "For You" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setFeedType("Following")}
            className={`px-4 py-1.5 font-semibold transition ${
              feedType === "Following" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Following
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="flex items-start gap-3">
        <img
          src="https://i.pravatar.cc/150?img=3"
          alt="me"
          className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0"
        />

        <div className="flex-1">
          <textarea
            rows={expanded ? 4 : 2}
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setExpanded(true)}
            className="w-full resize-none bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />

          {expanded && (
            <div className="mt-3">
              <input
                type="text"
                placeholder="Add image URL (optional)"
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          )}
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition"
          >
            <FaImage className="text-blue-600" size={18} /> Photo
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition">
            <FaVideo className="text-blue-600" size={18} /> Video
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition">
            <FaSmile className="text-blue-600" size={18} /> Feeling
          </button>
        </div>

        <button
          onClick={submitPost}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!text.trim() && !imgUrl.trim()}
        >
          Post
        </button>
      </div>
    </div>
  );
}