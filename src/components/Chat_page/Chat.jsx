import { useState, useRef, useEffect } from "react";

// DATA
import initialChats from "./data";

// SIDEBAR
import ChatSearch from "./Sidebar/ChatSearch";
import Stories from "./Sidebar/Stories";
import Tabs from "./Sidebar/Tabs";
import ChatList from "./Sidebar/ChatList";

// CHAT WINDOW
import ChatHeader from "./Window/ChatHeader";
import MessageList from "./Window/MessageList";
import MessageInput from "./Window/MessageInput";

function Chat() {
    const [chats, setChats] = useState(initialChats);
    const [activeChat, setActiveChat] = useState(initialChats[0]);

    const [newMessage, setNewMessage] = useState("");
    const [search, setSearch] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [reactingToMsg, setReactingToMsg] = useState(null);

    const [isReplying, setIsReplying] = useState(false);
    const [showMobileChat, setShowMobileChat] = useState(false);
    const chatEndRef = useRef(null);

    const emojis = ["😊", "👍", "🎉", "🔥", "😂", "💡", "😎", "❤️", "🙏", "🤔"];

    /** Scroll to bottom on new messages */
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeChat?.messages]);

    /** Keep activeChat synced with updated state */
    useEffect(() => {
        if (activeChat) {
            const updated = chats.find((c) => c.id === activeChat.id);
            if (updated && updated !== activeChat) {
                setActiveChat(updated);
            }
        }
    }, [chats]);

    /** Filter sidebar chats */
    const filteredChats = chats.filter((chat) => {
        const s = search.toLowerCase();
        const nameMatch = chat.name.toLowerCase().includes(s);
        const msgMatch = chat.messages.some((m) =>
            m.text.toLowerCase().includes(s)
        );
        return nameMatch || msgMatch;
    });

    const handleChatSelect = (chat) => {
        setActiveChat(chat);
        setShowMobileChat(true);
    };

    /** Send new message */
    const sendMessage = () => {
        if (!newMessage.trim() || isReplying) return;

        const msg = {
            id: Date.now(),
            from: "me",
            text: newMessage,
            timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            reactions: [],
            seen: false,
        };

        const updated = chats.map((chat) =>
            chat.id === activeChat.id
                ? { ...chat, messages: [...chat.messages, msg] }
                : chat
        );

        setChats(updated);
        setNewMessage("");
        setShowEmojiPicker(false);

        // Simulate auto reply
        setIsReplying(true);
        setTimeout(() => {
            const reply = {
                id: Date.now() + 1,
                from: "them",
                text: "Awesome, thanks for the update!",
                timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                reactions: [],
            };

            setChats((prev) =>
                prev.map((chat) =>
                    chat.id === activeChat.id
                        ? { ...chat, messages: [...chat.messages, reply] }
                        : chat
                )
            );

            setIsReplying(false);
        }, 2000);
    };

    /** Add reaction */
    const handleReact = (msgId, emoji) => {
        const updated = chats.map((chat) =>
            chat.id === activeChat.id
                ? {
                    ...chat,
                    messages: chat.messages.map((m) =>
                        m.id === msgId
                            ? {
                                ...m,
                                reactions: m.reactions.includes(emoji)
                                    ? m.reactions.filter((r) => r !== emoji)
                                    : [emoji],
                            }
                            : m
                    ),
                }
                : chat
        );

        setChats(updated);
        setReactingToMsg(null);
    };

    return (
        <div className="bg-gray-50 absolute inset-x-0 top-16 bottom-16 md:bottom-0 flex md:p-6 gap-6">

            {/* LEFT SIDEBAR */}
            <div className={`${showMobileChat ? 'hidden' : 'flex'} md:flex w-full md:w-96 flex-col bg-white md:border border-gray-200 md:rounded-2xl shadow-sm overflow-hidden`}>
                <ChatSearch search={search} setSearch={setSearch} />
                <Stories chats={chats} />
                <Tabs />
                <ChatList
                    chats={filteredChats}
                    activeChat={activeChat}
                    setActiveChat={handleChatSelect}
                />
            </div>

            {/* RIGHT CHAT WINDOW */}
            <div className={`${showMobileChat ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-white min-h-0 md:rounded-2xl shadow-sm md:border border-gray-200 overflow-hidden fixed inset-0 top-16 bottom-16 md:static z-20`}>
                {activeChat ? (
                    <>
                        <ChatHeader chat={activeChat} onBack={() => setShowMobileChat(false)} />

                        <MessageList
                            chat={activeChat}
                            emojis={emojis}
                            reactingToMsg={reactingToMsg}
                            setReactingToMsg={setReactingToMsg}
                            handleReact={handleReact}
                            chatEndRef={chatEndRef}
                            isReplying={isReplying}
                        />

                        <MessageInput
                            newMessage={newMessage}
                            setNewMessage={setNewMessage}
                            sendMessage={sendMessage}
                            showEmojiPicker={showEmojiPicker}
                            setShowEmojiPicker={setShowEmojiPicker}
                            emojis={emojis}
                            isReplying={isReplying}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
                        Select a chat to start messaging
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chat;
