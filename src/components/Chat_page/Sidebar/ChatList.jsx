import ChatListItem from "./ChatListItem";

function ChatList({ chats, activeChat, setActiveChat }) {
  return (
    <div className="flex-1 overflow-y-auto">
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
        />
      ))}
    </div>
  );
}

export default ChatList;
