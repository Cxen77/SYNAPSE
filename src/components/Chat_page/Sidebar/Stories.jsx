import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useStories } from "../../../hooks/useStories";
import { useAuth } from "../../../context/AuthContext";
import { FaPlus, FaPaperPlane, FaTrash } from "react-icons/fa";

function Stories() {
  const { stories, loading, createStory } = useStories();
  const { currentUser } = useAuth();
  const [viewer, setViewer] = useState(null); // { name, avatar, note, images, isCreate }

  // Check if I have an active story
  // Note: Backend populates userId, so we check userId._id or userId
  const myStory = stories.find(s => (s.userId._id === currentUser.uid || s.userId._id === currentUser._id || s.userId === currentUser._id));

  // Filter out my story from the main list to avoid duplication if we want
  // But usually we keep it in order or separate. Let's filter it out for "Other Users" section.
  const otherStories = stories.filter(s => s._id !== myStory?._id);

  if (loading) return (
    <div className="px-4 py-3 border-b border-gray-200 bg-white h-[120px] flex items-center justify-center">
      <span className="text-gray-400 text-sm">Loading stories...</span>
    </div>
  );

  return (
    <div className="py-3 border-b border-gray-200 bg-white">
      <div
        className="flex gap-4 overflow-x-auto items-start pb-4 px-4 scrollbar-hide"
        style={{ paddingTop: 45 }}
      >
        <style>
          {`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          `}
        </style>

        {/* YOUR NOTE / CREATE */}
        <StoryCircle
          name="You"
          avatar={currentUser?.profilePic || "https://via.placeholder.com/150"}
          note={myStory ? myStory.text : "Share a thought..."}
          isYou
          hasStory={!!myStory}
          onClick={() =>
            setViewer({
              name: currentUser?.displayName || currentUser?.name || "You",
              avatar: currentUser?.profilePic,
              note: myStory ? myStory.text : "",
              isCreate: !myStory,
              storyId: myStory?._id
            })
          }
        />

        {/* OTHER USERS */}
        {otherStories.map((story) => (
          <StoryCircle
            key={story._id}
            name={story.userId?.name || "User"}
            avatar={story.userId?.profilePic || "https://via.placeholder.com/150"}
            note={story.text}
            onClick={() =>
              setViewer({
                name: story.userId?.name || "User",
                avatar: story.userId?.profilePic,
                note: story.text,
                images: story.images
              })
            }
          />
        ))}
      </div>

      {/* FULLSCREEN VIEWER */}
      {viewer &&
        createPortal(
          <FullStoryViewer
            viewer={viewer}
            onClose={() => setViewer(null)}
            onCreate={createStory}
          />,
          document.body
        )}
    </div>
  );
}

function StoryCircle({ name, avatar, note, isYou, hasStory, onClick }) {
  const short = note && note.length > 12 ? note.slice(0, 12) + "…" : note;

  return (
    <div className="w-20 flex-shrink-0 flex flex-col items-center relative group cursor-pointer" onClick={onClick}>
      {/* Note icon/button (Bubble) */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center group-hover:-translate-y-1 transition-transform duration-300">
        <div className={`border text-gray-700 w-24 h-9 flex items-center justify-center rounded-xl text-[10px] font-medium shadow-sm relative px-2 ${isYou && !hasStory ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-gray-50 border-gray-200"}`}>
          {isYou && !hasStory ? (
            <div className="flex items-center gap-1"><FaPlus /> <span className="truncate">New Note</span></div>
          ) : (
            <span className="truncate w-full text-center">{short}</span>
          )}
        </div>
        {/* Tail */}
        <div className={`w-2 h-2 border-b border-r rotate-45 -mt-1 ${isYou && !hasStory ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}></div>
      </div>

      {/* Avatar circle */}
      <div
        className={`w-[60px] h-[60px] rounded-full flex items-center justify-center overflow-hidden border-2 transition-all ${isYou && !hasStory ? "border-dashed border-blue-300 hover:border-blue-500 bg-blue-50" : "border-blue-500 hover:scale-105"}`}
      >
        <img
          src={avatar || "https://via.placeholder.com/150"}
          className={`w-full h-full rounded-full object-cover ${isYou && !hasStory ? "opacity-70" : ""}`}
          alt={name}
        />
      </div>

      <span className="text-xs text-gray-800 mt-2 truncate w-full text-center font-medium">
        {name.split(" ")[0]}
      </span>
    </div>
  );
}

/* ---------------- FULLSCREEN VIEWER ---------------- */

function FullStoryViewer({ viewer, onClose, onCreate }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await onCreate(text);
      onClose(); // Close after create
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      onClick={onClose}
      className="
        fixed inset-0 bg-black/80 backdrop-blur-md 
        flex items-center justify-center z-[9999]
        animate-fadeIn p-4
      "
    >
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .animate-fadeIn { animation: fadeIn .25s ease-out forwards; }
          @keyframes scaleIn { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: scale(1); } }
          .animate-scaleIn { animation: scaleIn .25s ease-out forwards; }
        `}
      </style>

      <div
        className="bg-white rounded-3xl p-6 w-full max-w-sm animate-scaleIn shadow-2xl relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 p-2 hover:bg-gray-100 rounded-full transition"
        >
          ✕
        </button>

        <div className="flex flex-col items-center mb-6 mt-2">
          <div className="w-20 h-20 rounded-full p-1 border-2 border-dashed border-blue-400 mb-3">
            <img
              src={viewer.avatar || "https://via.placeholder.com/150"}
              className="w-full h-full rounded-full object-cover"
              alt={viewer.name}
            />
          </div>
          <h2 className="font-bold text-gray-900 text-lg">
            {viewer.isCreate ? "New Note" : viewer.name}
          </h2>
        </div>

        {/* Content */}
        {viewer.isCreate ? (
          <div className="w-full">
            <textarea
              autoFocus
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="What's on your mind? (Visible for 24h)"
              maxLength={100}
              className="w-full bg-blue-50 rounded-2xl p-4 text-center text-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none min-h-[120px]"
            />
            <div className="flex justify-between items-center mt-2 px-1 text-xs text-gray-400 font-medium">
              <span>{text.length}/100</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              {submitting ? "Posting..." : <>Share Note <FaPaperPlane /></>}
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar text-center px-2">
            <p className="text-gray-800 text-2xl leading-relaxed font-bold break-words">
              "{viewer.note}"
            </p>
            <p className="text-xs text-gray-400 mt-6 font-medium">Posted recenty</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Stories;
