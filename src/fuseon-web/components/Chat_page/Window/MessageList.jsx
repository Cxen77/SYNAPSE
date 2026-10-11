import MessageBubble from "./MessageBubble";

function MessageList({
  chat,
  emojis,
  reactingToMsg,
  setReactingToMsg,
  handleReact,
  chatEndRef,
  isReplying
}) {
  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 min-h-0 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'none' }}>
      <div className="flex flex-col gap-3">
        <div className="text-center text-gray-500 text-xs">Fri 23:07</div>

        {chat.messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isMe={msg.from === "me"}
            emojis={emojis}
            reactingToMsg={reactingToMsg}
            setReactingToMsg={setReactingToMsg}
            handleReact={handleReact}
          />
        ))}

        {/* Auto-typing bubble sits ABOVE the scroll bottom anchor */}
        {isReplying && (
          <div className="flex items-start gap-3">
            <img
              src={chat.avatar}
              alt="avatar"
              className="w-8 h-8 rounded-full ring-2 ring-gray-100"
            />
            <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-white text-gray-900 border border-gray-200 shadow-sm">
              <span className="italic text-gray-500 text-sm">typing...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>
    </div>
  );
}

export default MessageList;
