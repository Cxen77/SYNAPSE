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
import GroupChatModal from "./GroupChatModal"; // [Import GroupModal]
import { FaPlus } from "react-icons/fa"; // [Import Plus Icon]

// CHAT WINDOW
import ChatHeader from "./Window/ChatHeader";
import MessageList from "./Window/MessageList";
import MessageInput from "./Window/MessageInput";
import Skeleton from "../common/Skeleton";

import { useSocket } from "../../context/SocketContext";
import useVisualViewport from "../../hooks/useVisualViewport"; // [Import Viewport Hook]

function Chat() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const { onlineUsers } = useSocket(); // [Get Online Users]
    const viewport = useVisualViewport(); // [Moved to top]

    // FETCH CHATS LIST
    const { chats, loading: chatsLoading, accessChat, refetchChats } = useChats();

    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

    // ... (rest of state)

    // TEAMS TAB STATE
    const [activeTab, setActiveTab] = useState('messages');

    const handleStartChat = async (userId) => {
        try {
            const chat = await accessChat(userId);
            navigate(`/chat/${chat._id}`);
            setActiveTab('messages'); // Switch back to see the chat
        } catch (error) {
            console.error("Failed to start chat", error);
        }
    };

    // console.log("Chat Render. ID:", id);

    const [newMessage, setNewMessage] = useState("");
    const [search, setSearch] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [reactingToMsg, setReactingToMsg] = useState(null);
    const [isReplying, setIsReplying] = useState(false);
    const chatEndRef = useRef(null);
    const emojis = ["😊", "👍", "🎉", "🔥", "😂", "💡", "😎", "❤️", "🙏", "🤔"];

    // Transform API chats to UI shape
    const mappedChats = chats.map(c => {
        // [GROUP CHAT LOGIC]
        if (c.isGroupChat) {
            return {
                id: c._id,
                _id: c._id,
                name: c.chatName,
                avatar: "https://ui-avatars.com/api/?name=" + c.chatName + "&background=random",
                status: c.participants.length + " members",
                note: "Group Chat",
                messages: [],
                lastMessage: c.lastMessage,
                createdAt: c.createdAt,
                isGroupChat: true,
                groupAdmin: c.groupAdmin
            };
        }

        const other = c.participants.find(p => p._id !== currentUser._id) || {};

        // Force string comparison to avoid ObjectId mismatches
        const otherIdStr = other._id ? other._id.toString() : "";
        const isOnline = onlineUsers.has(otherIdStr) || onlineUsers.has(other._id);

        // Debug logging for Xelloyello or specific user issues
        // console.log(`[Chat Status] User: ${other.name} (${otherIdStr}) | Online: ${isOnline}`);

        return {
            id: c._id,
            _id: c._id,
            name: other.name || "User",
            avatar: other.profilePic || "https://via.placeholder.com/150",
            status: isOnline ? "Online" : "Offline",
            isOnline: isOnline,
            note: isOnline ? "Active Now" : (other.lastSeen ? "Last seen " + new Date(other.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Offline"),
            messages: [],
            lastMessage: c.lastMessage,
            createdAt: c.createdAt,
            isGroupChat: false
        };
    });

    // ACTIVE CHAT
    const [fetchedChat, setFetchedChat] = useState(null);
    useEffect(() => {
        if (id && !chats.find(c => c._id === id)) {
            api.get(`/chat/${id}`).then(({ data }) => {
                setFetchedChat(data);
            }).catch(e => console.error("Fetch single chat error:", e));
        } else {
            setFetchedChat(null);
        }
    }, [id, chats]);

    const activeChatRaw = id ? (location.state?.chat || chats.find(c => c._id === id) || fetchedChat) : null;

    const activeChat = activeChatRaw ? (() => {
        const c = activeChatRaw;
        // [GROUP CHAT LOGIC FOR ACTIVE]
        if (c.isGroupChat) {
            return {
                id: c._id,
                _id: c._id,
                name: c.chatName,
                avatar: "https://ui-avatars.com/api/?name=" + c.chatName + "&background=random",
                status: c.participants.length + " members",
                note: "Group Chat",
                messages: [],
                lastMessage: c.lastMessage,
                createdAt: c.createdAt,
                isGroupChat: true,
                groupAdmin: c.groupAdmin,
                participants: c.participants
            };
        }

        const other = c.participants.find(p => p._id !== currentUser._id) || {};
        const otherIdStr = other._id ? other._id.toString() : "";
        const isOnline = onlineUsers.has(otherIdStr) || onlineUsers.has(other._id);

        return {
            id: c._id,
            _id: c._id,
            name: other.name || "User",
            avatar: other.profilePic || "https://via.placeholder.com/150",
            status: isOnline ? "Online" : "Offline",
            isOnline: isOnline,
            note: isOnline ? "Active Now" : (other.lastSeen ? "Last seen " + new Date(other.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Offline"),
            messages: [],
            lastMessage: c.lastMessage,
            createdAt: c.createdAt,
            isGroupChat: false,
            participants: c.participants
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

    useEffect(() => {
        // console.log('[Chat.jsx] historyMessages updated:', historyMessages.length, historyMessages[historyMessages.length - 1]);
    }, [historyMessages]);

    // Auto-scroll
    useEffect(() => {
        if (!historyLoading) {
            // Use auto behavior instead of smooth to prevent the animated scroll down effect on initial load
            chatEndRef.current?.scrollIntoView({ behavior: "auto" });
        }
    }, [historyMessages, historyLoading, activeChat]);

    // [New] Scroll to bottom when keyboard opens
    // [Scalable & Smooth] Sticky Bottom Logic
    // Instead of a single timeout, we continuously anchor the scroll to the bottom during the keyboard transition.
    // This creates the "smooth" effect where messages slide up perfectly with the keyboard.
    useEffect(() => {
        if (viewport.offset > 0) {
            let frames = 0;
            const maxFrames = 30; // approx 500ms (enough for most keyboard animations)

            const animateScroll = () => {
                if (chatEndRef.current) {
                    chatEndRef.current.scrollIntoView({ behavior: "auto", block: "end" });
                }

                frames++;
                if (frames < maxFrames) {
                    requestAnimationFrame(animateScroll);
                }
            };

            // Start the scroll loop
            requestAnimationFrame(animateScroll);
        }
    }, [viewport.offset, viewport.height]);

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
                from: m.senderId === currentUser._id || m.senderId._id === currentUser._id ? "me" : "them", // [Handle Populated vs ID]
                sender: m.senderId, // [Pass sender info for group chats]
                text: m.text,
                timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                reactions: [],
            }))
        };
    }



    // Mobile Keyboard Fix:
    // When keyboard opens, viewport.height decreases.
    // We want the chat container to be full height (window.innerHeight) but with padding-bottom matching the keyboard height (viewport.offset).
    // This allows the input bar (flex bottom) to be pushed up.

    const isMobile = window.innerWidth < 768;
    const keyboardOpen = isMobile && activeChat && viewport.offset > 0;

    // [Debounced Loading State]
    // Prevents "flash" of skeletons on fast connections.
    const [showLoaders, setShowLoaders] = useState(false);
    useEffect(() => {
        let timer;
        if (historyLoading) {
            timer = setTimeout(() => setShowLoaders(true), 200); // Only show after 200ms
        } else {
            setShowLoaders(false);
        }
        return () => clearTimeout(timer);
    }, [historyLoading]);

    return (
        // Main Container
        <div className="bg-gray-50 absolute inset-x-0 top-0 bottom-0 md:top-16 flex md:p-6 md:gap-6" style={{ overscrollBehaviorY: 'none' }}>

            {/* ... (sidebar omitted for brevity) ... */}

            <GroupChatModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
                onGroupCreated={() => {
                    window.location.reload();
                }}
            />

            {/* LEFT SIDEBAR */}
            <div className={`${activeChat ? 'hidden' : 'flex'} md:flex w-full md:w-96 flex-col bg-white md:border border-gray-200 md:rounded-2xl shadow-sm overflow-hidden h-full pb-[60px] md:pb-0`}>
                <div className="flex items-center gap-2 p-4 pb-0">
                    <div className="flex-1">
                        <ChatSearch search={search} setSearch={setSearch} />
                    </div>
                    <button
                        onClick={() => setIsGroupModalOpen(true)}
                        className="bg-gray-100 p-3 rounded-xl text-gray-600 hover:bg-black hover:text-white transition-all shadow-sm"
                        title="Create Group Chat"
                    >
                        <FaPlus />
                    </button>
                </div>

                <Stories />
                <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

                {chatsLoading ? (
                    <div className="p-4 space-y-4">
                        <Skeleton variant="rectangular" className="h-16 w-full rounded-xl" />
                        <Skeleton variant="rectangular" className="h-16 w-full rounded-xl" />
                        <Skeleton variant="rectangular" className="h-16 w-full rounded-xl" />
                    </div>
                ) : activeTab === 'messages' ? (
                    mappedChats.filter(c => !c.isGroupChat).length > 0 ? (
                        <ChatList
                            chats={filteredChats.filter(chat => !chat.isGroupChat)}
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
                    mappedChats.filter(c => c.isGroupChat).length > 0 ? (
                        <ChatList
                            chats={filteredChats.filter(chat => chat.isGroupChat)}
                            activeChat={windowChat || activeChat}
                            setActiveChat={handleChatSelect}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white opacity-0 animate-fadeIn" style={{ animationFillMode: 'forwards' }}>
                            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6 shadow-sm group cursor-pointer hover:bg-purple-100 transition-colors">
                                <FaEdit size={32} className="text-purple-500 group-hover:scale-110 transition-transform -ml-1 mt-1" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No team chats yet</h3>
                            <p className="text-sm text-gray-500 mb-8 max-w-[240px] leading-relaxed mx-auto">
                                Join a team to start a group conversation.
                            </p>
                        </div>
                    )
                )}
            </div>

            {/* RIGHT CHAT WINDOW - KEYBOARD FIX APPLIED HERE */}
            {/* Native approach: interactive-widget=resizes-content in index.html handles the resize. */}
            <div
                className={`${activeChat ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-white min-h-0 md:rounded-2xl shadow-sm md:border border-gray-200 overflow-hidden fixed inset-0 md:static z-20`}
            // No manual style needed. The browser now resizing the viewport natively.
            >
                {windowChat ? (
                    <>
                        <ChatHeader chat={windowChat} onBack={() => navigate('/chat')} />

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
