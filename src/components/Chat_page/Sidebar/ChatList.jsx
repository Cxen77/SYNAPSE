import ChatListItem from "./ChatListItem";

function ChatList({ chats, activeChat, setActiveChat }) {
  return (
    <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
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
