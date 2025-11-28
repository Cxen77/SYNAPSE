import { FaSmile } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import ReactionPicker from "./ReactionPicker";

function MessageBubble({
  msg,
  isMe,
  emojis,
  reactingToMsg,
  setReactingToMsg,
  handleReact
}) {
  return (
    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
      <div className="group relative max-w-md">

        {/* MESSAGE BUBBLE */}
        <div
          className={`px-4 py-2.5 rounded-2xl shadow-sm ${
            isMe
              ? "bg-blue-600 text-white rounded-br-md"
              : "bg-white text-gray-900 rounded-bl-md border border-gray-200"
          }`}
        >
          <span className="break-words text-sm">{msg.text}</span>
        </div>

        {/* REACTIONS UNDER BUBBLE */}
        {msg.reactions.length > 0 && (
          <div className="absolute -bottom-2 right-2 flex gap-1 bg-white px-1.5 py-0.5 rounded-full border border-gray-200 shadow-sm">
            {msg.reactions.map((r, i) => (
              <span key={i} className="text-xs">
                {r}
              </span>
            ))}
          </div>
        )}

        {/* HOVER ACTIONS — REACT, MORE */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition ${
            isMe ? "-left-20" : "-right-20"
          }`}
        >
          {/* React button */}
          <button
            onClick={() =>
              setReactingToMsg(reactingToMsg === msg.id ? null : msg.id)
            }
            className="p-1.5 bg-white text-gray-600 rounded-full hover:bg-gray-100 border border-gray-200 shadow-sm"
            title="React"
          >
            <FaSmile size={14} />
          </button>

          {/* More options button */}
          <button className="p-1.5 bg-white text-gray-600 rounded-full hover:bg-gray-100 border border-gray-200 shadow-sm">
            <BsThreeDotsVertical size={12} />
          </button>
        </div>

        {/* REACTION PICKER POPUP */}
        {reactingToMsg === msg.id && (
          <ReactionPicker
            emojis={emojis}
            onSelect={(emoji) => handleReact(msg.id, emoji)}
            isMe={isMe}
          />
        )}
      </div>

      {/* TIMESTAMP + SEEN */}
      <div className="mt-1 flex items-center text-xs text-gray-500">
        <span className="mr-1">{msg.timestamp}</span>

        {/* Seen checkmark */}
        {isMe && msg.seen && (
          <span className="text-blue-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
