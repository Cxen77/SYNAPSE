import React, { useState, useRef } from "react";
import { FaImage, FaVideo, FaSmile, FaPaperPlane, FaTimes } from "react-icons/fa";
import api from "../../api/axios";
import Avatar from "../common/Avatar";

export default function FeedHeader({ user, feedType, setFeedType, onCreatePost }) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  // Handle click outside to collapse
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        // Only collapse if no content, or just collapse anyway as per user request
        setExpanded(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // If user is not loaded yet, we can show a skeleton or just render safely
  const displayUser = user || {};

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setExpanded(true);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function submitPost() {
    if (!text.trim() && !imageFile) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', text);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const { data } = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Pass the created post back to parent
      const newPost = {
        ...data,
        user: user || { name: displayUser.name, profilePic: displayUser.profilePic, course: displayUser.course }
      };

      onCreatePost(newPost);

      setText("");
      removeImage();
      setExpanded(false);
    } catch (err) {
      console.error("Failed to create post", err);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div ref={containerRef} className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 mb-6">
      {/* Feed Toggle */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-gray-900">Create Post</h3>
        <div className="bg-gray-50 rounded-lg p-1 flex text-sm border border-gray-200">
          <button
            onClick={() => setFeedType("For You")}
            className={`px-4 py-1.5 rounded-md font-semibold transition-all ${feedType === "For You" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
          >
            For You
          </button>
          <button
            onClick={() => setFeedType("Following")}
            className={`px-4 py-1.5 rounded-md font-semibold transition-all ${feedType === "Following" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Following
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="flex gap-4">
        <Avatar
          src={displayUser.profilePic}
          alt="me"
          size="md"
          className="ring-2 ring-gray-50 flex-shrink-0 bg-white"
        />

        <div className="flex-1">
          <div className="relative">
            <textarea
              rows={expanded || imagePreview ? 4 : 2}
              placeholder={`What's on your mind, ${displayUser.name ? displayUser.name.split(' ')[0] : 'User'}?`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setExpanded(true)}
              className="w-full resize-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400"
            />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-3 relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-60 rounded-lg border border-gray-200"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-gray-900/70 text-white p-1.5 rounded-full hover:bg-gray-900 transition"
              >
                <FaTimes size={12} />
              </button>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />

          {/* Actions Row */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm"
              >
                <FaImage className="text-blue-500" size={16} />
                <span className="hidden sm:inline">Photo</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-50 text-gray-600 hover:text-purple-600 font-medium transition-colors text-sm">
                <FaVideo className="text-purple-500" size={16} />
                <span className="hidden sm:inline">Video</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-orange-50 text-gray-600 hover:text-orange-600 font-medium transition-colors text-sm">
                <FaSmile className="text-orange-500" size={16} />
                <span className="hidden sm:inline">Feeling</span>
              </button>
            </div>

            <button
              onClick={submitPost}
              disabled={(!text.trim() && !imageFile) || isSubmitting}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Posting...
                </>
              ) : (
                <>
                  <FaPaperPlane size={12} />
                  Post
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}