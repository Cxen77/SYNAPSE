function ChatListItem({ chat, activeChat, setActiveChat }) {
  const lastMsg = chat.messages[chat.messages.length - 1];

  return (
    <div
      className={`flex p-3 gap-3 cursor-pointer transition ${activeChat?.id === chat.id
        ? "bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-600"
        : "border-l-4 border-transparent hover:bg-gray-50"
        }`}
      onClick={() => setActiveChat(chat)}
    >
      {/* Avatar */}
      <div className="relative">
        <img
          src={chat.avatar}
          alt={chat.name}
          className="w-14 h-14 rounded-full flex-shrink-0 object-cover border border-gray-200"
        />

        {chat.status === "Active now" && (
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
        )}
      </div>

      {/* Name + Message */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-gray-900 truncate block">
            {chat.name}
          </span>

          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
            {chat.id % 2 === 0 ? "7h" : "2h"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-gray-600 text-sm truncate block">
            {lastMsg?.text}
          </span>

          {activeChat?.id !== chat.id && (
            <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatListItem;
