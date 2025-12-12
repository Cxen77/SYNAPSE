function ChatListItem({ chat, activeChat, setActiveChat }) {
  const lastMsg = chat.lastMessage || (chat.messages && chat.messages[chat.messages.length - 1]);
  const isOnline = chat.status === "Online" || chat.status === "Active now";

  return (
    <div
      className={`flex p-3 gap-3 cursor-pointer transition ${activeChat?._id === chat._id
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

        {isOnline && (
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
            {lastMsg?.createdAt ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-gray-600 text-sm truncate block">
            {lastMsg?.text || "No messages yet"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ChatListItem;
