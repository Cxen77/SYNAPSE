import { useState, useRef, useEffect } from "react";
import { FaSmile, FaTrash, FaPaperPlane, FaSearch } from "react-icons/fa";
import { BsCameraVideo, BsThreeDotsVertical } from "react-icons/bs";

// (Your initialChats data remains exactly the same)
const initialChats = [
  {
    id: 1,
    name: "Alice Johnson",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    messages: [
      { id: 1, from: "them", text: "Hey! Did you finish the hackathon submission?", timestamp: "10:30 AM", reactions: [] },
      { id: 2, from: "me", text: "Almost! Just polishing the UI. 😅", timestamp: "10:31 AM", reactions: ["👍"], seen: true },
      { id: 3, from: "them", text: "Cool! I’m testing the backend now.", timestamp: "10:32 AM", reactions: [] },
    ],
  },
  {
    id: 2,
    name: "Bob Smith",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    messages: [
      { id: 1, from: "them", text: "Are we ready for the gaming tournament tonight?", timestamp: "11:00 AM", reactions: [] },
      { id: 2, from: "me", text: "Yep! My character is fully upgraded 🗡️", timestamp: "11:01 AM", reactions: ["🔥"], seen: true },
      { id: 3, from: "them", text: "Awesome! Let’s win this.", timestamp: "11:02 AM", reactions: ["🎉"] },
    ],
  },
  {
    id: 3,
    name: "Charlie Lee",
    avatar: "https://randomuser.me/api/portraits/men/76.jpg",
    messages: [
      { id: 1, from: "them", text: "The group project presentation is at 5pm.", timestamp: "1:15 PM", reactions: [] },
      { id: 2, from: "me", text: "Got it! I’ll finalize the slides by 4:30.", timestamp: "1:16 PM", reactions: ["👍"], seen: true },
      { id: 3, from: "them", text: "Don’t forget to check the API integration.", timestamp: "1:17 PM", reactions: [] },
    ],
  },
  {
    id: 4,
    name: "Diana Prince",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    messages: [
      { id: 1, from: "them", text: "Game dev team is meeting at 3pm.", timestamp: "2:40 PM", reactions: [] },
      { id: 2, from: "me", text: "Cool, I’ll bring the character designs 🎨", timestamp: "2:41 PM", reactions: [], seen: true },
      { id: 3, from: "them", text: "Perfect, see you then!", timestamp: "2:41 PM", reactions: [] },
    ],
  },
];

const emojis = ["😊", "👍", "🎉", "🔥", "😂", "💡", "😎", "❤️", "🙏", "🤔"];

function Chat() {
  const [chats, setChats] =useState(initialChats);
  const [activeChat, setActiveChat] = useState(initialChats[0]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactingToMsg, setReactingToMsg] = useState(null);
  const [isReplying, setIsReplying] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  useEffect(() => {
    if (activeChat) {
      const newActiveChatData = chats.find(c => c.id === activeChat.id);
      setActiveChat(newActiveChatData);
    }
  }, [chats]);

  const filteredChats = chats.filter((chat) => {
    const lowerSearch = search.toLowerCase();
    const nameMatch = chat.name.toLowerCase().includes(lowerSearch);
    const messageMatch = chat.messages.some((msg) =>
      msg.text.toLowerCase().includes(lowerSearch)
    );
    return nameMatch || messageMatch;
  });

  const sendMessage = () => {
    if (!newMessage.trim() || isReplying) return;
    
    const newMsg = {
      id: Date.now(),
      from: "me",
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [],
      seen: false, 
    };

    const updatedChats = chats.map((chat) =>
      chat.id === activeChat.id
        ? { ...chat, messages: [...chat.messages, newMsg] }
        : chat
    );
    setChats(updatedChats);
    setNewMessage("");
    setShowEmojiPicker(false);

    setIsReplying(true);
    setTimeout(() => {
      const replyText = "Awesome, thanks for the update!";
      const replyMsg = {
        id: Date.now() + 1,
        from: "them",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: [],
      };

      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === activeChat.id) {
            const messagesWithSeen = chat.messages.map((m, index) => 
              index === chat.messages.length - 1 ? { ...m, seen: true } : m
            );
            return { ...chat, messages: [...messagesWithSeen, replyMsg] };
          }
          return chat;
        });
      });
      setIsReplying(false);
    }, 2000); 
  };

  const deleteMessage = (msgId) => {
    const updatedChats = chats.map((chat) =>
      chat.id === activeChat.id
        ? { ...chat, messages: chat.messages.filter((msg) => msg.id !== msgId) }
        : chat
    );
    setChats(updatedChats);
  };

  const addEmojiToInput = (emoji) => {
    setNewMessage(newMessage + emoji);
  };

  const handleReact = (msgId, emoji) => {
    const updatedChats = chats.map((chat) =>
      chat.id === activeChat.id
        ? {
            ...chat,
            messages: chat.messages.map((msg) => {
              if (msg.id !== msgId) return msg;
              if (msg.reactions.includes(emoji)) {
                return { ...msg, reactions: msg.reactions.filter((r) => r !== emoji) };
              } else {
                return { ...msg, reactions: [...msg.reactions, emoji] };
              }
            }),
          }
        : chat
    );
    setChats(updatedChats);
    setReactingToMsg(null);
  };

  // --- NEW ---
  // 1. Root div is now a gray, padded background
  // 2. The main component is inside a white, rounded, shadow "card"
  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-100 p-8"> 
      
      {/* This is the new white "card" container */}
      <div className="flex h-full w-full bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        
        {/* ======================= */}
        {/* Sidebar (Contact List)  */}
        {/* ======================= */}
        {/* Inherits bg-white from parent */}
        <div className="w-96 flex flex-col border-r border-gray-200">
          
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Messaging</h2>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FaSearch />
              </span>
              <input
                type="text"
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                // bg-gray-100 to match the active chat item
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`flex p-4 gap-3 cursor-pointer border-l-4 ${
                  activeChat?.id === chat.id
                    ? "bg-gray-100 border-blue-500" // Active state
                    : "border-transparent hover:bg-gray-50" // Inactive state
                }`}
                onClick={() => setActiveChat(chats.find(c => c.id === chat.id))}
              >
                <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-800 truncate block">{chat.name}</span>
                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                      {chat.messages[chat.messages.length - 1]?.timestamp}
                    </span>
                  </div>
                  <span className="text-gray-500 text-sm truncate block">
                    {chat.messages[chat.messages.length - 1]?.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ======================= */}
        {/* Chat Window             */}
        {/* ======================= */}
        {/* Inherits bg-white from parent */}
        <div className="flex-1 flex flex-col">
          {activeChat ? (
            <>
              {/* Chat Header (inherits bg-white) */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between shadow-sm">
                {/* Left Side: User Info */}
                <div className="flex items-center gap-4">
                  <img src={activeChat.avatar} alt={activeChat.name} className="w-10 h-10 rounded-full" />
                  <div className="flex flex-col">
                    <span className="font-bold text-lg text-gray-800">{activeChat.name}</span>
                    <span className="text-sm text-gray-500 flex items-center">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                      Available on mobile
                    </span>
                  </div>
                </div>
                
                {/* Right Side: Action Buttons */}
                <div className="flex items-center gap-4 text-gray-500">
                  <button className="p-2 rounded-full hover:bg-gray-100" title="Start video call">
                    <BsCameraVideo size={20} />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100" title="More options">
                    <BsThreeDotsVertical size={20} />
                  </button>
                </div>
              </div>

              {/* --- NEW --- Messages Area now has bg-gray-50 */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-1 bg-gray-50">
                {activeChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.from === "me" ? "self-end" : "self-start"
                    }`}
                  >
                    <div className="group relative max-w-lg">
                      <div
                        className={`px-4 py-2 rounded-xl shadow-md ${
                          msg.from === "me"
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-white text-gray-900 rounded-bl-none border border-gray-200" // bg-white contrasts with gray-50
                        }`}
                      >
                        <span className="break-words">{msg.text}</span>
                        <span className="text-xs opacity-70 ml-2 pt-1 float-right">
                          {msg.timestamp}
                        </span>
                      </div>
                      
                      {/* Reactions Display */}
                      {msg.reactions.length > 0 && (
                        <div className="absolute -bottom-4 left-2 flex gap-1 bg-white px-2 py-0.5 rounded-full shadow-md border border-gray-200">
                          {msg.reactions.map((r, i) => (
                            <span key={i} className="text-xs">{r}</span>
                          ))}
                        </div>
                      )}

                      {/* Hover Actions */}
                      <div className="absolute top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150
                                      data-[from=me]:-left-16 data-[from=them]:-right-16"
                             data-from={msg.from === "me" ? "me" : "them"}>
                        <button
                          onClick={() => setReactingToMsg(reactingToMsg === msg.id ? null : msg.id)}
                          className="p-1.5 bg-white text-gray-500 rounded-full shadow-md hover:bg-gray-100 border border-gray-200"
                          title="React"
                        >
                          <FaSmile />
                        </button>
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="p-1.5 bg-white text-red-500 rounded-full shadow-md hover:bg-red-100 border border-gray-200"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      
                      {/* Reaction Picker */}
                      {reactingToMsg === msg.id && (
                        <div className="absolute z-10 -top-10 flex gap-1 bg-white p-2 rounded-full shadow-lg border border-gray-200
                                        data-[from=me]:left-0 data-[from=them]:right-0"
                               data-from={msg.from === "me" ? "me" : "them"}>
                          {emojis.map((e) => (
                            <button
                              key={e}
                              onClick={() => handleReact(msg.id, e)}
                              className="text-lg hover:scale-125 transition-transform"
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Seen/Delivered Status */}
                    {msg.from === "me" && (
                      <span className="text-xs text-gray-500 self-end mt-1 pr-1">
                        {msg.seen ? 'Seen' : 'Delivered'}
                      </span>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isReplying && (
                  <div className="self-start flex items-center gap-2 mb-2">
                    <img src={activeChat.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                    <div className="px-4 py-2 rounded-xl shadow-md bg-white text-gray-900 rounded-bl-none border border-gray-200">
                      <span className="italic text-gray-500">typing...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input (inherits bg-white) */}
              <div className="p-4 border-t border-gray-200 relative">
                {showEmojiPicker && (
                  <div className="absolute bottom-20 left-4 bg-white p-2 rounded-lg shadow-xl grid grid-cols-5 gap-1 border border-gray-200">
                    {emojis.map((e) => (
                      <button
                        key={e}
                        onClick={() => addEmojiToInput(e)}
                        className="text-2xl p-1 rounded-lg hover:bg-gray-200"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-3 text-xl text-gray-500 rounded-full hover:bg-gray-100"
                  >
                    <FaSmile />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled={isReplying} 
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-600 shadow-md disabled:opacity-50"
                    disabled={isReplying}
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            </>
          ) : (
            // This now inherits bg-white, which is correct
            <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;