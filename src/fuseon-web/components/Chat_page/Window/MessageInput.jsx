import { useState, useRef } from "react";
import { FaSmile, FaArrowUp } from "react-icons/fa";

function MessageInput({
  newMessage,
  setNewMessage,
  sendMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  emojis,
  isReplying,
  sendTypingStart,
  sendTypingStop
}) {
  const [isTyping, setIsTyping] = useState(false);
  const startTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (value.trim() !== "") {
      if (!isTyping) {
        setIsTyping(true);
        if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
        startTimeoutRef.current = setTimeout(() => {
          sendTypingStart();
        }, 300);
      }
    } else {
      if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
      sendTypingStop();
      setIsTyping(false);
    }
  };

  const handleBlur = () => {
    if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
    sendTypingStop();
    setIsTyping(false);
  };

  const handleSend = () => {
    if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
    sendTypingStop();
    setIsTyping(false);
    sendMessage();
  };
  return (
    <div className="p-2 sm:p-3 bg-white border-t border-gray-200 flex-shrink-0 relative w-full box-border">

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-6 bg-white p-3 rounded-xl shadow-xl grid grid-cols-5 gap-2 border border-gray-200">
          {emojis.map((e) => (
            <button
              key={e}
              onClick={() => setNewMessage(newMessage + e)}
              className="text-2xl p-2 rounded-lg hover:bg-gray-100 transition"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-center">
        {/* Emoji toggle */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-blue-600 rounded-lg hover:bg-blue-50 transition"
          title="Emoji picker"
        >
          <FaSmile size={20} />
        </button>

        {/* Textbox */}
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Message..."
          className="flex-1 min-w-0 bg-gray-100 border-none rounded-full px-3 py-2 sm:px-4 sm:py-2.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          disabled={isReplying}
        />



        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || isReplying}
          className={`p-2.5 rounded-full transition shadow-sm flex items-center justify-center ${newMessage.trim() && !isReplying
            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          title="Send message"
        >
          <FaArrowUp size={18} />
        </button>
      </div>
    </div>
  );
}

export default MessageInput;
