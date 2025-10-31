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
    <div className="bg-white rounded-2xl shadow-sm p-4">
      {/* top row: input + toggles on right */}
      <div className="flex items-start gap-4">
        <img
          src="https://i.pravatar.cc/150?img=3"
          alt="me"
          className="w-12 h-12 rounded-full object-cover"
        />

        <div className="flex-1">
          <textarea
            rows={expanded ? 4 : 1}
            placeholder="Start a post..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setExpanded(true)}
            className="w-full resize-none bg-gray-100 rounded-full px-4 py-2 outline-none text-sm"
          />

          {expanded && (
            <div className="mt-3">
              <input
                type="text"
                placeholder="Image URL (optional)"
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm outline-none"
              />
            </div>
          )}

          {/* actions */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100"
              >
                <FaImage /> Photo
              </button>
              <button className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100">
                <FaVideo /> Video
              </button>
              <button className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100">
                <FaSmile /> Feeling
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Feed toggle - small pill */}
              <div className="bg-gray-100 rounded-full overflow-hidden flex text-sm">
                <button
                  onClick={() => setFeedType("For You")}
                  className={`px-3 py-1 ${
                    feedType === "For You" ? "bg-blue-600 text-white" : "text-gray-600"
                  }`}
                >
                  For You
                </button>
                <button
                  onClick={() => setFeedType("Following")}
                  className={`px-3 py-1 ${
                    feedType === "Following" ? "bg-blue-600 text-white" : "text-gray-600"
                  }`}
                >
                  Following
                </button>
              </div>

              <button
                onClick={submitPost}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
