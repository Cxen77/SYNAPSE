import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";

function Stories({ chats = [] }) {
  const [viewer, setViewer] = useState(null); // { name, avatar, note }

  return (
    <div className="px-4 py-3 border-b border-gray-200 bg-white">
      <div
        className="flex gap-4 overflow-x-auto items-start pb-4 scrollbar-hide"
        style={{ paddingTop: 28 }}
      >
        <style>
          {`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          `}
        </style>

        {/* YOUR NOTE */}
        <StoryCircle
          name="You"
          avatar="📝"
          note="Your personal note—click to view full!"
          isYou
          onClick={() =>
            setViewer({
              name: "Your Note",
              avatar: "📝",
              note: "Your personal note—click to view full!"
            })
          }
        />

        {/* OTHER USERS */}
        {chats.map((c) => (
          <StoryCircle
            key={c.id}
            name={c.name}
            avatar={c.avatar}
            note={c.note}
            onClick={() =>
              setViewer({
                name: c.name,
                avatar: c.avatar,
                note: c.note
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
          />,
          document.body
        )}
    </div>
  );
}

function StoryCircle({ name, avatar, note, isYou, onClick }) {
  const short = note.length > 12 ? note.slice(0, 12) + "…" : note;

  return (
    <div className="w-20 flex-shrink-0 flex flex-col items-center relative">
      {/* Note icon/button */}
      <button
        className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-0.5 rounded-md text-[10px] truncate max-w-[90px] focus:outline-none"
        onClick={onClick}
        title="View note"
      >
        {short}
      </button>

      {/* Avatar circle (no gradient) */}
      <div
        className="w-[64px] h-[64px] rounded-full flex items-center justify-center overflow-hidden bg-white border border-gray-300"
      >
        {isYou ? (
          <div className="text-2xl">📝</div>
        ) : (
          <img
            src={avatar}
            className="w-full h-full rounded-full object-cover"
          />
        )}
      </div>

      <span className="text-xs text-gray-800 mt-1 truncate w-full text-center">
        {name.split(" ")[0]}
      </span>
    </div>
  );
}

/* ---------------- FULLSCREEN VIEWER ---------------- */

function FullStoryViewer({ viewer, onClose }) {
  return (
    <div
      onClick={onClose}
      className="
        fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm 
        flex items-center justify-center z-[9999]
        animate-fadeIn
      "
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn .25s ease-out forwards;
          }

          @keyframes scaleIn {
            from { opacity: 0; transform: scale(.85); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-scaleIn {
            animation: scaleIn .25s ease-out forwards;
          }
        `}
      </style>

      <div
        className="bg-white rounded-xl p-6 w-[90%] max-w-[360px] animate-scaleIn shadow-2xl"
        onClick={(e) => e.stopPropagation()} // prevent closing on inner click
      >
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar */}
          {viewer.avatar === "📝" ? (
            <div className="text-3xl">📝</div>
          ) : (
            <img
              src={viewer.avatar}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500"
            />
          )}

          <h2 className="font-bold text-gray-900 text-lg">
            {viewer.name}
          </h2>
        </div>

        {/* Full note */}
        <p className="text-gray-800 leading-relaxed text-[15px] whitespace-pre-wrap">
          {viewer.note}
        </p>

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg w-full hover:bg-gray-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default Stories;
