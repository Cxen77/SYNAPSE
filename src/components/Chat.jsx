import { useState, useRef, useEffect } from "react";
import { FaSmile, FaTrash, FaPaperPlane, FaSearch, FaPhone, FaHeart, FaImage } from "react-icons/fa";
import { BsCameraVideo, BsThreeDotsVertical, BsMicFill } from "react-icons/bs";
import { HiPencilSquare } from "react-icons/hi2";

const initialChats = [
  {
    id: 1,
    name: "Alice Johnson",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "Active 5m ago",
    note: "🎮 Gaming tonight! I'm planning to stream the whole tournament if the internet holds up.",
    messages: [
      { id: 1, from: "them", text: "Hey! Did you finish the hackathon submission?", timestamp: "10:30 AM", reactions: [] },
      { id: 2, from: "me", text: "Almost! Just polishing the UI. 😅", timestamp: "10:31 AM", reactions: ["👍"], seen: true },
      { id: 3, from: "them", text: "Cool! I'm testing the backend now.", timestamp: "10:32 AM", reactions: [] },
      { id: 4, from: "me", text: "The new UI animations are smooth!", timestamp: "10:45 AM", reactions: [] },
      { id: 5, from: "them", text: "Nice! Send me the demo link when you're done.", timestamp: "10:46 AM", reactions: ["👌"] },
      { id: 6, from: "me", text: "Will do. Should be live in 10 minutes.", timestamp: "10:50 AM", reactions: [], seen: true },
      { id: 7, from: "them", text: "Got it, I'll check it out right away.", timestamp: "10:52 AM", reactions: ["✅"] },
      { id: 8, from: "me", text: "Just pushed the final commit to the main branch.", timestamp: "10:55 AM", reactions: [], seen: true },
      { id: 9, from: "them", text: "Perfect timing! See you at the live stream tonight.", timestamp: "10:57 AM", reactions: ["🎉"] },
      { id: 10, from: "me", text: "Looking forward to it! Don't forget the pizza order 🍕", timestamp: "10:58 AM", reactions: ["😂"], seen: true },
    ],
  },
  {
    id: 2,
    name: "Bob Smith",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    status: "Active 2h ago",
    note: "💻 Coding non-stop for the next two days, don't disturb me unless it's an emergency.",
    messages: [
      { id: 1, from: "them", text: "Are we ready for the gaming tournament tonight?", timestamp: "11:00 AM", reactions: [] },
      { id: 2, from: "me", text: "Yep! My character is fully upgraded 🗡️", timestamp: "11:01 AM", reactions: ["🔥"], seen: true },
      { id: 3, from: "them", text: "Awesome! Let's win this.", timestamp: "11:02 AM", reactions: ["🎉"] },
      { id: 4, from: "me", text: "I found a new hidden item that gives a huge attack boost!", timestamp: "11:10 AM", reactions: [], seen: true },
      { id: 5, from: "them", text: "No way! Where is it?", timestamp: "11:11 AM", reactions: ["💡"] },
      { id: 6, from: "me", text: "I'll show you in the lobby right before the match starts.", timestamp: "11:15 AM", reactions: [], seen: true },
      { id: 7, from: "them", text: "Sounds good, I'm logging on now.", timestamp: "11:20 AM", reactions: ["👍"] },
    ],
  },
  {
    id: 3,
    name: "Charlie Lee",
    avatar: "https://randomuser.me/api/portraits/men/76.jpg",
    status: "Active 1h ago",
    note: "📚 Studying for the final exam in Quantum Physics. Wish me luck!",
    messages: [
      { id: 1, from: "them", text: "The group project presentation is at 5pm.", timestamp: "1:15 PM", reactions: [] },
      { id: 2, from: "me", text: "Got it! I'll finalize the slides by 4:30.", timestamp: "1:16 PM", reactions: ["👍"], seen: true },
      { id: 3, from: "them", text: "Don't forget to check the API integration.", timestamp: "1:17 PM", reactions: [] },
      { id: 4, from: "me", text: "Integration check complete, looks solid.", timestamp: "1:20 PM", reactions: ["✅"], seen: true },
      { id: 5, from: "them", text: "Great work! See you in the meeting room.", timestamp: "1:21 PM", reactions: ["😎"] },
    ],
  },
  {
    id: 4,
    name: "Diana Prince",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    status: "Active now",
    note: "🎨 Designing the new app interface, focusing on user accessibility first.",
    messages: [
      { id: 1, from: "them", text: "Game dev team is meeting at 3pm.", timestamp: "2:40 PM", reactions: [] },
      { id: 2, from: "me", text: "Cool, I'll bring the character designs 🎨", timestamp: "2:41 PM", reactions: [], seen: true },
      { id: 3, from: "them", text: "Perfect, see you then!", timestamp: "2:41 PM", reactions: [] },
      { id: 4, from: "them", text: "Can you also prep a quick summary of the accessibility changes?", timestamp: "2:45 PM", reactions: [] },
      { id: 5, from: "me", text: "Yep, summarized all WCAG compliance points.", timestamp: "2:46 PM", reactions: ["✨"], seen: true },
      { id: 6, from: "them", text: "That's exactly what we need, thanks!", timestamp: "2:47 PM", reactions: ["❤️"] },
    ],
  },
  // --- ADDED MORE CONTACTS ---
  {
    id: 5,
    name: "Eve Martinez",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    status: "Active 3m ago",
    note: "☕ Coffee Break",
    messages: [
      { id: 1, from: "them", text: "Found a critical bug in the matrix.", timestamp: "9:00 AM", reactions: [] },
      { id: 2, from: "me", text: "On it. Sending patches now.", timestamp: "9:01 AM", reactions: ["💻"], seen: true },
      { id: 3, from: "them", text: "Roger that.", timestamp: "9:02 AM", reactions: [] },
    ],
  },
  {
    id: 6,
    name: "Frank White",
    avatar: "https://randomuser.me/api/portraits/men/21.jpg",
    status: "Active 10m ago",
    note: "🏃 At the gym",
    messages: [
      { id: 1, from: "them", text: "Client demo pushed to tomorrow.", timestamp: "12:00 PM", reactions: [] },
      { id: 2, from: "me", text: "Got it. Need to finalize the report.", timestamp: "12:01 PM", reactions: ["✅"], seen: true },
      { id: 3, from: "them", text: "Good luck!", timestamp: "12:02 PM", reactions: [] },
      { id: 4, from: "me", text: "The final slide deck looks incredible, just reviewed it.", timestamp: "12:15 PM", reactions: [], seen: true },
    ],
  },
  {
    id: 7,
    name: "Grace Hall",
    avatar: "https://randomuser.me/api/portraits/women/89.jpg",
    status: "Active 4h ago",
    note: "🍔 Lunch!",
    messages: [
      { id: 1, from: "them", text: "Is the new logo ready for review?", timestamp: "1:00 PM", reactions: [] },
      { id: 2, from: "me", text: "Yes, files sent via email 📤", timestamp: "1:01 PM", reactions: ["🎨"], seen: true },
      { id: 3, from: "them", text: "Looks great!", timestamp: "1:02 PM", reactions: [] },
      { id: 4, from: "me", text: "Which color scheme did you prefer?", timestamp: "1:05 PM", reactions: ["🤔"], seen: true },
      { id: 5, from: "them", text: "The one with the dark blue background.", timestamp: "1:06 PM", reactions: ["👍"] },
    ],
  },
  {
    id: 8,
    name: "Henry King",
    avatar: "https://randomuser.me/api/portraits/men/88.jpg",
    status: "Active now",
    note: "😴 Taking a nap (jk, coding!)",
    messages: [
      { id: 1, from: "them", text: "Did you check the server logs?", timestamp: "3:00 PM", reactions: [] },
      { id: 2, from: "me", text: "Checking now. Looks clean.", timestamp: "3:01 PM", reactions: ["👍"], seen: true },
      { id: 3, from: "them", text: "Perfect, thanks.", timestamp: "3:02 PM", reactions: [] },
    ],
  },
  {
    id: 9,
    name: "Ivy Chen",
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    status: "Active 15m ago",
    note: "💡 Planning next sprint features.",
    messages: [
      { id: 1, from: "them", text: "Remember the meeting at 4 PM for sprint review.", timestamp: "3:30 PM", reactions: [] },
      { id: 2, from: "me", text: "Setting a reminder now.", timestamp: "3:31 PM", reactions: [], seen: true },
      { id: 3, from: "them", text: "Awesome! I'll prepare the final estimates.", timestamp: "3:35 PM", reactions: ["🙏"] },
    ],
  },
  {
    id: 10,
    name: "Jack Brown",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    status: "Active 5s ago",
    note: "🚀 Deploying!",
    messages: [
      { id: 1, from: "them", text: "Deployment status?", timestamp: "3:40 PM", reactions: [] },
      { id: 2, from: "me", text: "Green! 🟢 Live in production.", timestamp: "3:41 PM", reactions: ["🎉"], seen: true },
      { id: 3, from: "them", text: "Celebration time!", timestamp: "3:42 PM", reactions: ["🔥"] },
    ],
  },
  // --- SCROLLING DEMO CONTACTS ---
  {
    id: 11,
    name: "Kelly Green",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    status: "Active 1h ago",
    note: "🎵 Listening to new album releases.",
    messages: [
      { id: 1, from: "them", text: "Did you receive the invoice?", timestamp: "9:30 AM", reactions: [] },
      { id: 2, from: "me", text: "Yes, processed it this morning.", timestamp: "9:31 AM", reactions: ["✅"], seen: true },
    ],
  },
  {
    id: 12,
    name: "Leo Torres",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    status: "Active 20m ago",
    note: "✈️ Next stop: Tokyo!",
    messages: [
      { id: 1, from: "me", text: "What time is the flight tomorrow?", timestamp: "10:00 AM", reactions: [] },
      { id: 2, from: "them", text: "Departure is at 7:00 AM.", timestamp: "10:01 AM", reactions: ["👍"] },
    ],
  },
  {
    id: 13,
    name: "Mia Rodriguez",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    status: "Active 5s ago",
    note: "📸 Photo shoot prep.",
    messages: [
      { id: 1, from: "them", text: "Need the final edits by noon.", timestamp: "11:30 AM", reactions: [] },
      { id: 2, from: "me", text: "On it!", timestamp: "11:31 AM", reactions: ["😎"], seen: true },
    ],
  },
  {
    id: 14,
    name: "Noah Davis",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    status: "Active now",
    note: "🛠️ Fixing a tricky CSS bug.",
    messages: [
      { id: 1, from: "me", text: "Have you seen this weird layout issue?", timestamp: "1:00 PM", reactions: [] },
      { id: 2, from: "them", text: "Yes, it's a z-index problem. I'll take a look.", timestamp: "1:01 PM", reactions: ["💡"] },
    ],
  },
  {
    id: 15,
    name: "Olivia Chen",
    avatar: "https://randomuser.me/api/portraits/women/6.jpg",
    status: "Active 1d ago",
    note: "🧘 Meditation time.",
    messages: [
      { id: 1, from: "them", text: "Reminder: PTO starts Friday.", timestamp: "2:00 PM", reactions: [] },
      { id: 2, from: "me", text: "Confirmed. Have a great time off!", timestamp: "2:01 PM", reactions: ["🎉"], seen: true },
    ],
  },
  {
    id: 16,
    name: "Peter Quinn",
    avatar: "https://randomuser.me/api/portraits/men/7.jpg",
    status: "Active 30m ago",
    note: "📈 Analyzing market data.",
    messages: [
      { id: 1, from: "them", text: "The Q3 reports are ready.", timestamp: "4:00 PM", reactions: [] },
      { id: 2, from: "me", text: "Sending my analysis now.", timestamp: "4:01 PM", reactions: ["✅"], seen: true },
    ],
  },
  {
    id: 17,
    name: "Quincy Ross",
    avatar: "https://randomuser.me/api/portraits/men/8.jpg",
    status: "Active now",
    note: "🍕 Pizza night!",
    messages: [
      { id: 1, from: "me", text: "What kind of pizza do you want?", timestamp: "5:00 PM", reactions: [] },
      { id: 2, from: "them", text: "Pepperoni, please!", timestamp: "5:01 PM", reactions: ["👍"] },
    ],
  },
  {
    id: 18,
    name: "Ruby Stone",
    avatar: "https://randomuser.me/api/portraits/women/9.jpg",
    status: "Active 40m ago",
    note: "💻 Debugging a legacy system.",
    messages: [
      { id: 1, from: "them", text: "The server crashed again.", timestamp: "6:00 PM", reactions: [] },
      { id: 2, from: "me", text: "Restoring from backup.", timestamp: "6:01 PM", reactions: ["🛠️"], seen: true },
    ],
  },
  {
    id: 19,
    name: "Sam Taylor",
    avatar: "https://randomuser.me/api/portraits/men/10.jpg",
    status: "Active 2h ago",
    note: "🏔️ Planning a hiking trip.",
    messages: [
      { id: 1, from: "me", text: "Did you book the trail permits?", timestamp: "7:00 PM", reactions: [] },
      { id: 2, from: "them", text: "Not yet, I'll do it tonight.", timestamp: "7:01 PM", reactions: ["🙏"] },
    ],
  },
  {
    id: 20,
    name: "Uma Vance",
    avatar: "https://randomuser.me/api/portraits/women/11.jpg",
    status: "Active now",
    note: "🥳 Birthday tomorrow!",
    messages: [
      { id: 1, from: "them", text: "See you at the party tomorrow!", timestamp: "8:00 PM", reactions: [] },
      { id: 2, from: "me", text: "Wouldn't miss it!", timestamp: "8:01 PM", reactions: ["🎉"], seen: true },
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
    // Scroll to bottom of chat window
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  useEffect(() => {
    // Keep activeChat synchronized with latest chats state
    if (activeChat) {
      const newActiveChatData = chats.find(c => c.id === activeChat.id);
      if (newActiveChatData && newActiveChatData !== activeChat) {
          setActiveChat(newActiveChatData);
      }
    }
  }, [chats, activeChat]);

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

    // Simulate an auto-reply
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
            // Mark the sent message as seen
            const messagesWithSeen = chat.messages.map((m, index) => 
              index === chat.messages.length - 1 && m.from === "me" ? { ...m, seen: true } : m
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
              // Simple toggle reaction logic
              if (msg.reactions.includes(emoji)) {
                return { ...msg, reactions: msg.reactions.filter((r) => r !== emoji) };
              } else {
                // Allows multiple reactions, but for simplicity, we'll just add/remove
                return { ...msg, reactions: [...msg.reactions.filter((r) => !emojis.includes(r)), emoji] }; 
              }
            }),
          }
        : chat
    );
    setChats(updatedChats);
    setReactingToMsg(null);
  };

  return (
    // Outer div: Ensures the component takes up all available vertical space below the hypothetical fixed header (top-16)
    // and correctly manages the layout without causing the whole page to scroll.
    <div 
      className="bg-gray-50 absolute inset-x-0 top-16 bottom-0 flex flex-col"
    >
      <div className="flex-1 overflow-hidden"> 
        {/* Content Area: Set to h-full (100% of parent's available space) */}
        <div className="flex h-full">
          
          {/* Sidebar (Contact List) - START */}
          <div className="w-96 flex flex-col bg-white border-r border-gray-200">
            
            {/* Sidebar Header - FIXED (flex-shrink-0) */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
             
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Stories/Notes Section - FIXED (flex-shrink-0) */}
            <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
              <div className="flex gap-4 overflow-x-auto items-start">
                
                {/* Your Note */}
                <div className="flex flex-col items-center flex-shrink-0 w-20">
                  
                  {/* Note placeholder for alignment */}
                  <div className="h-7 w-full flex items-center justify-center py-1 mb-2"> 
                      <span className="text-xs text-blue-600 font-medium">New Note</span>
                  </div> 
                  
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl">
                        📝
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 mt-1 truncate w-full text-center">Your note</span>
                </div>
                
                {/* Other Users' Notes - Hover to expand width and show full text */}
                {chats.slice(0, 4).map((chat) => (
                  <div key={chat.id} className="flex flex-col items-center flex-shrink-0 w-20">
                    
                    {/* Note Bubble (Box) - Default narrow width (w-16), hover:w-auto to expand */}
                    <span 
                      className="bg-gray-100 text-xs text-gray-900 px-1 py-1 rounded-md shadow-inner border border-gray-200 font-medium w-16 text-center cursor-pointer transition-all duration-300 overflow-hidden h-7 flex items-center justify-center leading-tight mb-2 hover:w-auto hover:overflow-visible hover:whitespace-normal hover:z-10 relative"
                      // title={chat.note} - Removed title to prioritize the hover effect
                    >
                      {/* Inner span handles the initial truncation/ellipsis visibility */}
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis w-full block">
                        {chat.note}
                      </span>
                    </span>

                    <div className="relative"> 
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
                        <img src={chat.avatar} alt={chat.name} className="w-full h-full rounded-full object-cover border-2 border-white" />
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 mt-1 truncate w-full text-center">{chat.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* End of Stories/Notes Section */}

            {/* Tab Navigation - FIXED (flex-shrink-0) */}
            <div className="flex px-4 py-2 border-b border-gray-200 flex-shrink-0">
              <button className="flex-1 text-sm font-bold text-gray-900 pb-2 border-b-2 border-blue-600">
                Messages
              </button>
              <button className="flex-1 text-sm font-medium text-gray-600 pb-2 hover:text-gray-900 transition flex items-center justify-center gap-1">
                Requests 
                <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">2</span>
              </button>
            </div>

            {/* Contact List - SCROLLABLE AREA (flex-1 overflow-y-auto) */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex p-3 gap-3 cursor-pointer transition ${
                    activeChat?.id === chat.id
                      ? "bg-blue-50 border-l-4 border-blue-600"
                      : "border-l-4 border-transparent hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveChat(chats.find(c => c.id === chat.id))}
                >
                  <div className="relative">
                    <img src={chat.avatar} alt={chat.name} className="w-14 h-14 rounded-full flex-shrink-0 object-cover ring-2 ring-gray-100" />
                    {chat.status === "Active now" && (
                      <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-900 truncate block">{chat.name}</span>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {/* A rough timestamp logic for demonstration, you can improve this */}
                        {chat.id % 2 === 0 ? '7h' : '2h'} 
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600 text-sm truncate block">
                        {chat.messages[chat.messages.length - 1]?.text}
                      </span>
                      {activeChat?.id !== chat.id && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Sidebar (Contact List) - END */}

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-white min-h-0">
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <img src={activeChat.avatar} alt={activeChat.name} className="w-10 h-10 rounded-full ring-2 ring-blue-100" />
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{activeChat.name}</span>
                      <span className="text-xs text-gray-600">{activeChat.status}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg hover:bg-blue-100 transition text-blue-600" title="Voice call">
                      <FaPhone size={18} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-blue-100 transition text-blue-600" title="Video call">
                      <BsCameraVideo size={20} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-blue-100 transition text-blue-600" title="More options">
                      <BsThreeDotsVertical size={20} />
                    </button>
                  </div>
                </div>

                {/* Messages Area - SCROLLABLE (flex-1 overflow-y-auto) */}
                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-gray-50 min-h-0">
                  <div className="text-center text-gray-500 text-xs">Fri 23:07</div>
                  {activeChat.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.from === "me" ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="group relative max-w-md">
                        <div
                          className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                            msg.from === "me"
                              ? "bg-blue-600 text-white rounded-br-md"
                              : "bg-white text-gray-900 rounded-bl-md border border-gray-200"
                          }`}
                        >
                          <span className="break-words text-sm">{msg.text}</span>
                        </div>
                        
                        {/* Reactions Display */}
                        {msg.reactions.length > 0 && (
                          <div className="absolute -bottom-2 right-2 flex gap-1 bg-white px-1.5 py-0.5 rounded-full border border-gray-200 shadow-sm">
                            {msg.reactions.map((r, i) => (
                              <span key={i} className="text-xs">{r}</span>
                            ))}
                          </div>
                        )}

                        {/* Hover Actions */}
                        <div className={`absolute top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${
                          msg.from === "me" ? "-left-20" : "-right-20"
                        }`}>
                          <button
                            onClick={() => setReactingToMsg(reactingToMsg === msg.id ? null : msg.id)}
                            className="p-1.5 bg-white text-gray-600 rounded-full hover:bg-gray-100 border border-gray-200 shadow-sm"
                            title="React"
                          >
                            <FaSmile size={14} />
                          </button>
                          <button className="p-1.5 bg-white text-gray-600 rounded-full hover:bg-gray-100 border border-gray-200 shadow-sm">
                            <span className="text-xs">↩</span>
                          </button>
                          <button className="p-1.5 bg-white text-gray-600 rounded-full hover:bg-gray-100 border border-gray-200 shadow-sm">
                            <BsThreeDotsVertical size={12} />
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
                      
                      {/* Message metadata (Timestamp and Seen) */}
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <span className="mr-1">{msg.timestamp}</span>
                        {msg.from === "me" && msg.seen && (
                            <span className="text-blue-500">
                                {/* Double checkmark/seen icon for visual feedback */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                        )}
                      </div>

                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isReplying && (
                    <div className="flex items-start gap-3">
                      <img src={activeChat.avatar} alt="avatar" className="w-8 h-8 rounded-full ring-2 ring-gray-100" />
                      <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-white text-gray-900 border border-gray-200 shadow-sm">
                        <span className="italic text-gray-500 text-sm">typing...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-gray-200 flex-shrink-0 relative">
                  {showEmojiPicker && (
                    <div className="absolute bottom-20 left-6 bg-white p-3 rounded-xl shadow-xl grid grid-cols-5 gap-2 border border-gray-200">
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
                  
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                      title="Emoji picker"
                    >
                      <FaSmile size={20} />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Message..."
                      className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      disabled={isReplying} 
                    />
                    <button className="p-2 text-blue-600 rounded-lg hover:bg-blue-50 transition" title="Voice message">
                      <BsMicFill size={20} />
                    </button>
                    <button className="p-2 text-blue-600 rounded-lg hover:bg-blue-50 transition" title="Send image">
                      <FaImage size={20} />
                    </button>
                    <button 
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || isReplying}
                      className={`p-2 rounded-lg transition ${
                        newMessage.trim() && !isReplying
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                      title="Send message"
                    >
                      <FaPaperPlane size={20} />
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