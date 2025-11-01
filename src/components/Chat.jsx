import { useState, useRef, useEffect } from "react";
import { FaSmile, FaTrash, FaPaperPlane, FaSearch, FaPhone } from "react-icons/fa";
import { BsCameraVideo, BsThreeDotsVertical } from "react-icons/bs";

const initialChats = [
  {
    id: 1,
    name: "Alice Johnson",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    messages: [
      { id: 1, from: "them", text: "Hey! Did you finish the hackathon submission?", timestamp: "10:30 AM", reactions: [] },
      { id: 2, from: "me", text: "Almost! Just polishing the UI. 😅", timestamp: "10:31 AM", reactions: ["👍"], seen: true },
      { id: 3, from: "them", text: "Cool! I'm testing the backend now.", timestamp: "10:32 AM", reactions: [] },
    ],
  },
  {
    id: 2,
    name: "Bob Smith",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    messages: [
      { id: 1, from: "them", text: "Are we ready for the gaming tournament tonight?", timestamp: "11:00 AM", reactions: [] },
      { id: 2, from: "me", text: "Yep! My character is fully upgraded 🗡️", timestamp: "11:01 AM", reactions: ["🔥"], seen: true },
      { id: 3, from: "them", text: "Awesome! Let's win this.", timestamp: "11:02 AM", reactions: ["🎉"] },
    ],
  },
  {
    id: 3,
    name: "Charlie Lee",
    avatar: "https://randomuser.me/api/portraits/men/76.jpg",
    messages: [
      { id: 1, from: "them", text: "The group project presentation is at 5pm.", timestamp: "1:15 PM", reactions: [] },
      { id: 2, from: "me", text: "Got it! I'll finalize the slides by 4:30.", timestamp: "1:16 PM", reactions: ["👍"], seen: true },
      { id: 3, from: "them", text: "Don't forget to check the API integration.", timestamp: "1:17 PM", reactions: [] },
    ],
  },
  {
    id: 4,
    name: "Diana Prince",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    messages: [
      { id: 1, from: "them", text: "Game dev team is meeting at 3pm.", timestamp: "2:40 PM", reactions: [] },
      { id: 2, from: "me", text: "Cool, I'll bring the character designs 🎨", timestamp: "2:41 PM", reactions: [], seen: true },
      { id: 3, from: "them", text: "Perfect, see you then!", timestamp: "2:41 PM", reactions: [] },
    ],
  },
];

const emojis = ["😊", "👍", "🎉", "🔥", "😂", "💡", "😎", "❤️", "🙏", "🤔"];

function Chat() {
  const [chats, setChats] = useState(initialChats);
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

  return (
    <div className="bg-gray-50 h-screen w-full flex flex-col overflow-hidden">

      <div className="flex-1 overflow-hidden">
        <div className="flex h-full bg-white border-gray-200">
          
          {/* Sidebar (Contact List) */}
          <div className="w-80 flex flex-col border-r border-gray-200 bg-white">
            
            {/* Sidebar Header */}
            <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Chats</h2>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                />
              </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex p-4 gap-3 cursor-pointer transition ${
                    activeChat?.id === chat.id
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : "border-l-4 border-transparent hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveChat(chats.find(c => c.id === chat.id))}
                >
                  <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full flex-shrink-0 ring-2 ring-gray-100" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-900 truncate block">{chat.name}</span>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {chat.messages[chat.messages.length - 1]?.timestamp}
                      </span>
                    </div>
                    <span className="text-gray-600 text-sm truncate block">
                      {chat.messages[chat.messages.length - 1]?.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-white min-h-0">
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex items-center gap-4">
                    <img src={activeChat.avatar} alt={activeChat.name} className="w-12 h-12 rounded-full ring-2 ring-blue-100" />
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-gray-900">{activeChat.name}</span>
                      <span className="text-sm text-gray-600 flex items-center">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Active now
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2.5 rounded-lg hover:bg-blue-100 transition text-blue-600" title="Voice call">
                      <FaPhone size={18} />
                    </button>
                    <button className="p-2.5 rounded-lg hover:bg-blue-100 transition text-blue-600" title="Video call">
                      <BsCameraVideo size={20} />
                    </button>
                    <button className="p-2.5 rounded-lg hover:bg-blue-100 transition text-blue-600" title="More options">
                      <BsThreeDotsVertical size={20} />
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-gray-50 min-h-0">
                  {activeChat.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.from === "me" ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="group relative max-w-md">
                        <div
                          className={`px-4 py-3 rounded-2xl shadow-sm ${
                            msg.from === "me"
                              ? "bg-blue-600 text-white rounded-br-md"
                              : "bg-white text-gray-900 rounded-bl-md border border-gray-200"
                          }`}
                        >
                          <span className="break-words">{msg.text}</span>
                          <span className={`text-xs ml-2 pt-1 float-right ${msg.from === "me" ? "text-blue-100" : "text-gray-500"}`}>
                            {msg.timestamp}
                          </span>
                        </div>
                        
                        {/* Reactions Display */}
                        {msg.reactions.length > 0 && (
                          <div className="absolute -bottom-3 left-3 flex gap-1 bg-white px-2 py-1 rounded-full shadow-md border border-gray-200">
                            {msg.reactions.map((r, i) => (
                              <span key={i} className="text-sm">{r}</span>
                            ))}
                          </div>
                        )}

                        {/* Hover Actions */}
                        <div className={`absolute top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${
                          msg.from === "me" ? "-left-16" : "-right-16"
                        }`}>
                          <button
                            onClick={() => setReactingToMsg(reactingToMsg === msg.id ? null : msg.id)}
                            className="p-2 bg-white text-gray-600 rounded-full shadow-md hover:bg-gray-100 border border-gray-200"
                            title="React"
                          >
                            <FaSmile size={14} />
                          </button>
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="p-2 bg-white text-red-500 rounded-full shadow-md hover:bg-red-50 border border-gray-200"
                            title="Delete"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                        
                        {/* Reaction Picker */}
                        {reactingToMsg === msg.id && (
                          <div className={`absolute z-10 -top-12 flex gap-1 bg-white p-2 rounded-full shadow-lg border border-gray-200 ${
                            msg.from === "me" ? "left-0" : "right-0"
                          }`}>
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
                        <span className="text-xs text-gray-500 mt-1 pr-1">
                          {msg.seen ? '✓✓ Seen' : '✓ Delivered'}
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isReplying && (
                    <div className="flex items-start gap-3">
                      <img src={activeChat.avatar} alt="avatar" className="w-8 h-8 rounded-full ring-2 ring-gray-100" />
                      <div className="px-4 py-3 rounded-2xl rounded-bl-md shadow-sm bg-white text-gray-900 border border-gray-200">
                        <span className="italic text-gray-500">typing...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 bg-white relative flex-shrink-0">
                  {showEmojiPicker && (
                    <div className="absolute bottom-24 left-6 bg-white p-3 rounded-xl shadow-xl grid grid-cols-5 gap-2 border border-gray-200">
                      {emojis.map((e) => (
                        <button
                          key={e}
                          onClick={() => addEmojiToInput(e)}
                          className="text-2xl p-2 rounded-lg hover:bg-gray-100 transition"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-3 text-xl text-gray-500 rounded-full hover:bg-gray-100 transition"
                    >
                      <FaSmile />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 border border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      disabled={isReplying} 
                    />
                    <button
                      onClick={sendMessage}
                      className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition"
                      disabled={isReplying}
                    >
                      <FaPaperPlane />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
                Select a chat to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;