import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useChats, useChatHistory } from "../../hooks/useChat";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { FaEdit, FaRegPaperPlane } from "react-icons/fa";

// SIDEBAR
import ChatSearch from "./Sidebar/ChatSearch";
import Stories from "./Sidebar/Stories";
import Tabs from "./Sidebar/Tabs";
import ChatList from "./Sidebar/ChatList";

// CHAT WINDOW
import ChatHeader from "./Window/ChatHeader";
import MessageList from "./Window/MessageList";
import MessageInput from "./Window/MessageInput";
import Skeleton from "../common/Skeleton";

function Chat() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();

    // FETCH CHATS LIST
    const { chats, loading: chatsLoading, accessChat } = useChats();

    // TEAMS TAB STATE
    const [activeTab, setActiveTab] = useState('messages');
    const [teams, setTeams] = useState([]);
    const [teamsLoading, setTeamsLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'teams' && teams.length === 0) {
            setTeamsLoading(true);
            api.get('/teams')
                .then(({ data }) => setTeams(data))
                .catch(err => console.error("Failed to fetch teams", err))
                .finally(() => setTeamsLoading(false));
        }
    }, [activeTab]);

    // Flatten unique members for "Teammates" list (excluding self)
    const uniqueTeammates = Array.from(
        new Map(
            teams.flatMap(t => t.members)
                .filter(m => m._id !== currentUser._id)
                .map(m => [m._id, m])
        ).values()
    );

    const handleStartChat = async (userId) => {
        try {
            const chat = await accessChat(userId);
            navigate(`/chat/${chat._id}`);
            setActiveTab('messages'); // Switch back to see the chat
        } catch (error) {
            console.error("Failed to start chat", error);
        }
    };

    console.log("Chat Render. ID:", id);
    console.log("Location State:", location.state);
    console.log("Chats loaded:", chats.length);

    const [newMessage, setNewMessage] = useState("");
    const [search, setSearch] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [reactingToMsg, setReactingToMsg] = useState(null);
    const [isReplying, setIsReplying] = useState(false);
    const chatEndRef = useRef(null);
    const emojis = ["😊", "👍", "🎉", "🔥", "😂", "💡", "😎", "❤️", "🙏", "🤔"];

    // Transform API chats to UI shape
    const mappedChats = chats.map(c => {
        const other = c.participants.find(p => p._id !== currentUser._id) || {};
        return {
            id: c._id,
            _id: c._id,
            name: other.name || "User",
            avatar: other.profilePic || "https://via.placeholder.com/150",
            status: other.status || "Offline",
            note: "Active " + (other.lastSeen ? new Date(other.lastSeen).toLocaleTimeString() : "recently"),
            messages: [],
            lastMessage: c.lastMessage,
            createdAt: c.createdAt
        };
    });

    // ACTIVE CHAT
    const [fetchedChat, setFetchedChat] = useState(null);
    useEffect(() => {
        if (id && !chats.find(c => c._id === id)) {
            console.log("Chat ID not in list. Fetching manually:", id);
            api.get(`/chat/${id}`).then(({ data }) => {
                console.log("Fetched single chat:", data);
                setFetchedChat(data);
            }).catch(e => console.error("Fetch single chat error:", e));
        } else {
            setFetchedChat(null);
        }
    }, [id, chats]);

    const activeChatRaw = id ? (location.state?.chat || chats.find(c => c._id === id) || fetchedChat) : null;

    const activeChat = activeChatRaw ? (() => {
        const c = activeChatRaw;
        const other = c.participants.find(p => p._id !== currentUser._id) || {};
        return {
            id: c._id,
            _id: c._id,
            name: other.name || "User",
            avatar: other.profilePic || "https://via.placeholder.com/150",
            status: other.status || "Offline",
            note: "Active " + (other.lastSeen ? new Date(other.lastSeen).toLocaleTimeString() : "recently"),
            messages: [],
            lastMessage: c.lastMessage,
            createdAt: c.createdAt
        };
    })() : null;

    // FETCH HISTORY
    const {
        messages: historyMessages,
        loading: historyLoading,
        loadMore,
        hasMore,
        sendMessage,
        sendTyping,
        typingUsers
    } = useChatHistory(id);

    // Auto-scroll
    useEffect(() => {
        if (!historyLoading) {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [historyMessages, historyLoading, activeChat]);

    // Typing debounce
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (activeChat) sendTyping(false);
        }, 2000);
        if (newMessage && activeChat) sendTyping(true);
        return () => clearTimeout(timeout);
    }, [newMessage, activeChat]);

    // Filter
    const filteredChats = mappedChats.filter((chat) => {
        const s = search.toLowerCase();
        const nameMatch = chat.name.toLowerCase().includes(s);
        const msgMatch = chat.lastMessage?.text?.toLowerCase().includes(s);
        return nameMatch || msgMatch;
    });

    const handleChatSelect = (chat) => {
        navigate(`/chat/${chat._id}`);
    };

    /** Send new message */
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeChat) return;

        setIsReplying(true);
        try {
            await sendMessage(newMessage);
            setNewMessage("");
            setShowEmojiPicker(false);
        } catch (error) {
            console.error("Failed to send", error);
        } finally {
            setIsReplying(false);
        }
    };

    const handleReact = (msgId, emoji) => {
        setReactingToMsg(null);
    };

    // Prepare active chat object for Window
    let windowChat = null;
    if (activeChat) {
        windowChat = {
            ...activeChat,
            status: typingUsers.length > 0 ? "Typing..." : activeChat.status,
            messages: historyMessages.map(m => ({
                id: m._id,
                from: m.senderId === currentUser._id || m.senderId._id === currentUser._id ? "me" : "them",
                text: m.text,
                timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                reactions: [],
                seen: m.readBy.length > 1
            }))
        };
    }

    return (
        <div className={`bg-gray-50 absolute inset-x-0 top-0 ${activeChat ? 'bottom-0' : 'bottom-16'} md:top-16 md:bottom-0 flex md:p-6 gap-6`}>
            {/* LEFT SIDEBAR */}
            <div className={`${activeChat ? 'hidden' : 'flex'} md:flex w-full md:w-96 flex-col bg-white md:border border-gray-200 md:rounded-2xl shadow-sm overflow-hidden h-full`}>
                <ChatSearch search={search} setSearch={setSearch} />
                <Stories />
                <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

                {chatsLoading ? (
                    <div className="p-4 space-y-4">
                        <Skeleton variant="rectangular" className="h-16 w-full rounded-xl" />
                        <Skeleton variant="rectangular" className="h-16 w-full rounded-xl" />
                        <Skeleton variant="rectangular" className="h-16 w-full rounded-xl" />
                    </div>
                ) : activeTab === 'messages' ? (
                    mappedChats.length > 0 ? (
                        <ChatList
                            chats={filteredChats}
                            activeChat={windowChat || activeChat}
                            setActiveChat={handleChatSelect}
                        />
                    ) : (
                        // THEMED EMPTY STATE
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white opacity-0 animate-fadeIn" style={{ animationFillMode: 'forwards' }}>
                            <style>{`
                                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                            `}</style>
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-sm group cursor-pointer hover:bg-blue-100 transition-colors">
                                <FaRegPaperPlane size={32} className="text-blue-500 group-hover:scale-110 transition-transform -ml-1 mt-1" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No messages yet</h3>
                            <p className="text-sm text-gray-500 mb-8 max-w-[240px] leading-relaxed mx-auto">
                                Connect with your friends and teammates to start a conversation.
                            </p>
                            <button
                                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2"
                                onClick={() => setActiveTab('teams')}
                            >
                                <FaEdit />
                                Find Teammates
                            </button>
                        </div>
                    )
                ) : (
                    // TEAMS TAB CONTENT
                    <div className="flex-1 overflow-y-auto">
                        {teamsLoading ? (
                            <div className="p-4 space-y-4">
                                <Skeleton variant="rectangular" className="h-12 w-full rounded-xl" />
                                <Skeleton variant="rectangular" className="h-12 w-full rounded-xl" />
                            </div>
                        ) : uniqueTeammates.length > 0 ? (
                            uniqueTeammates
                                .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
                                .map(member => (
                                    <div
                                        key={member._id}
                                        onClick={() => handleStartChat(member._id)}
                                        className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                                    >
                                        <img
                                            src={member.profilePic || "https://via.placeholder.com/150"}
                                            alt={member.name}
                                            className="w-10 h-10 rounded-full object-cover border border-gray-100"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 text-sm truncate">{member.name}</h4>
                                            <p className="text-xs text-gray-500 truncate">Tap to message</p>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No teammates found. Join a team to see members here!
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* RIGHT CHAT WINDOW */}
            <div className={`${activeChat ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-white min-h-0 md:rounded-2xl shadow-sm md:border border-gray-200 overflow-hidden fixed inset-0 md:static z-20`}>
                {windowChat ? (
                    <>
                        <ChatHeader chat={windowChat} onBack={() => navigate('/chat')} />

                        {(historyLoading && historyMessages.length === 0) ? (
                            <div className="flex-1 p-6 space-y-4">
                                <Skeleton variant="rectangular" className="h-10 w-2/3 rounded-xl" />
                                <Skeleton variant="rectangular" className="h-10 w-1/2 rounded-xl self-end" />
                                <Skeleton variant="rectangular" className="h-10 w-3/4 rounded-xl" />
                            </div>
                        ) : (
                            <MessageList
                                chat={windowChat}
                                emojis={emojis}
                                reactingToMsg={reactingToMsg}
                                setReactingToMsg={setReactingToMsg}
                                handleReact={handleReact}
                                chatEndRef={chatEndRef}
                                isReplying={isReplying || historyLoading}
                                loadMore={loadMore}
                            />
                        )}

                        <MessageInput
                            newMessage={newMessage}
                            setNewMessage={setNewMessage}
                            sendMessage={handleSendMessage}
                            showEmojiPicker={showEmojiPicker}
                            setShowEmojiPicker={setShowEmojiPicker}
                            emojis={emojis}
                            isReplying={isReplying}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center bg-white">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <FaRegPaperPlane size={36} className="text-blue-500 -ml-1 mt-1" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Synapse Chat</h3>
                        <p className="text-gray-500">Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chat;
