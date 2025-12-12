import React, { useState, useRef } from "react";
import { HiPhotograph, HiVideoCamera, HiEmojiHappy, HiPaperAirplane, HiX } from "react-icons/hi";
import api from "../../api/axios";
import Avatar from "../common/Avatar";

export default function FeedHeader({ user, feedType, setFeedType, onCreatePost }) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // If user is not loaded yet, we can show a skeleton or just render safely
  const displayUser = user || {};

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
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
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error("Failed to create post", err);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden transition-shadow hover:shadow-md">
      {/* Header Tabs - Segmented Control Style */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setFeedType("For You")}
          className={`flex-1 py-4 text-sm font-semibold transition-all duration-200 relative ${feedType === "For You"
            ? "text-blue-600"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
        >
          For You
          {feedType === "For You" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 mx-auto w-16 rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setFeedType("Following")}
          className={`flex-1 py-4 text-sm font-semibold transition-all duration-200 relative ${feedType === "Following"
            ? "text-blue-600"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
        >
          Following
          {feedType === "Following" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 mx-auto w-16 rounded-t-full"></div>
          )}
        </button>
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-5">
        <div className="flex gap-3 md:gap-4">
          <div className="hidden sm:block pt-1">
            <Avatar
              src={displayUser.profilePic}
              alt="me"
              size="md"
              className="ring-2 ring-white shadow-sm"
            />
          </div>
          <div className="block sm:hidden pt-1">
            <Avatar
              src={displayUser.profilePic}
              alt="me"
              size="sm"
              className="ring-2 ring-white shadow-sm"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="relative">
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder={`What's happening?`}
                value={text}
                onChange={handleTextChange}
                className="w-full resize-none bg-transparent border-none p-0 py-2 text-base md:text-lg placeholder-gray-400 focus:ring-0 outline-none text-gray-900 min-h-[50px] md:min-h-[60px]"
              />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-3 relative inline-block group">
                <div className="relative rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 w-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                </div>
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-full backdrop-blur-sm transition-all shadow-sm"
                >
                  <HiX size={14} className="stroke-2" />
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

            <div className="mt-3 pt-3 flex items-center justify-between border-t border-gray-50">
              {/* Media Actions */}
              <div className="flex items-center gap-0.5 md:gap-2 -ml-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors relative group"
                  title="Add Photo"
                >
                  <HiPhotograph size={20} className="md:w-6 md:h-6" />
                </button>
                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors" title="Add Video">
                  <HiVideoCamera size={20} className="md:w-6 md:h-6" />
                </button>
                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors" title="Feeling/Activity">
                  <HiEmojiHappy size={20} className="md:w-6 md:h-6" />
                </button>
              </div>

              {/* Submit Button */}
              <button
                onClick={submitPost}
                disabled={(!text.trim() && !imageFile) || isSubmitting}
                className="bg-blue-600 text-white px-5 py-1.5 md:px-6 md:py-2 rounded-full text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transform active:scale-95"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}