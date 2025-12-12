import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

// Hook for fetching list of chats
export const useChats = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const { data } = await api.get('/chat');
                setChats(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchChats();
    }, []);

    const accessChat = async (userId) => {
        try {
            const { data } = await api.post('/chat', { userId });

            // Check if chat already exists in list
            if (!chats.find(c => c._id === data._id)) {
                setChats(prev => [data, ...prev]);
            }
            return data;
        } catch (error) {
            console.error("Error accessing chat:", error);
            throw error;
        }
    };

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            // Update chat list order and last message
            setChats(prev => {
                const chatIndex = prev.findIndex(c => c._id === newMessage.chatId);
                if (chatIndex > -1) {
                    const updatedChat = {
                        ...prev[chatIndex],
                        lastMessage: newMessage,
                        updatedAt: newMessage.createdAt
                    };
                    // Move to top
                    const newChats = [...prev];
                    newChats.splice(chatIndex, 1);
                    return [updatedChat, ...newChats];
                }
                // If chat not in list (new chat), simple re-fetch or manual add if we have full chat data
                // For now, simpler to refetch if not found to get full structure
                return prev;
            });
        };

        socket.on('message:new', handleNewMessage);
        return () => socket.off('message:new', handleNewMessage);
    }, [socket]);

    return { chats, loading, accessChat };
};

// Hook for single chat interaction
export const useChatHistory = (chatId) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [typingUsers, setTypingUsers] = useState(new Set());

    const { socket } = useSocket();
    const { currentUser } = useAuth();

    // Pagination
    const fetchHistory = useCallback(async (cursor = null) => {
        if (!chatId || (!cursor && loading)) return; // Prevent double init

        setLoading(true);
        try {
            const params = { limit: 30 };
            if (cursor) params.cursor = cursor;

            const { data } = await api.get(`/chat/history/${chatId}`, { params });

            if (data.length < 30) setHasMore(false);

            setMessages(prev => cursor ? [...data, ...prev] : data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [chatId]);

    // Initial load
    useEffect(() => {
        if (chatId) {
            setMessages([]);
            setHasMore(true);
            fetchHistory();
        }
    }, [chatId, fetchHistory]);

    useEffect(() => {
        if (!socket || !chatId) return;

        console.log('[useChat] Joining chat room:', chatId);
        socket.emit('join:chat', chatId);

        const handleNewMessage = (msg) => {
            console.log('[useChat] Received message:new event:', msg);
            if (msg.chatId === chatId) {
                console.log('[useChat] Message matches current chat, adding to state');
                setMessages(prev => {
                    // Check for duplicates
                    if (prev.some(m => m._id === msg._id)) {
                        console.log('[useChat] Message already exists, skipping');
                        return prev;
                    }
                    return [...prev, msg];
                });
                // Mark read immediately if we see it
                api.post('/chat/read', { chatId });
            } else {
                console.log('[useChat] Message is for different chat:', msg.chatId);
            }
        };

        const handleTyping = ({ userId, isTyping }) => {
            console.log('[useChat] Typing event:', { userId, isTyping });
            setTypingUsers(prev => {
                const newSet = new Set(prev);
                if (isTyping) newSet.add(userId);
                else newSet.delete(userId);
                return newSet;
            });
        };

        console.log('[useChat] Attaching socket listeners');
        socket.on('message:new', handleNewMessage);
        socket.on('user:typing', handleTyping);

        return () => {
            console.log('[useChat] Cleaning up socket listeners');
            socket.off('message:new', handleNewMessage);
            socket.off('user:typing', handleTyping);
        };
    }, [socket, chatId]);

    const sendMessage = async (text, attachments = []) => {
        console.log('[useChat] Sending message:', { chatId, text });
        try {
            const { data } = await api.post('/chat/send', {
                chatId,
                text,
                attachments
            });

            console.log('[useChat] Message sent successfully:', data.message);

            // Optimistically append the message to local state
            setMessages(prev => {
                // Prevent duplicates if socket event already arrived
                if (prev.some(m => m._id === data.message._id)) {
                    console.log('[useChat] Optimistic update: message already exists');
                    return prev;
                }
                console.log('[useChat] Optimistically adding message to UI');
                return [...prev, data.message];
            });

            return data.message;
        } catch (err) {
            console.error('[useChat] Send message error:', err);
            throw err;
        }
    };

    const sendTyping = (isTyping) => {
        if (socket) socket.emit('user:typing', { chatId, isTyping });
    };

    return {
        messages,
        loading,
        hasMore,
        loadMore: () => fetchHistory(messages[0]?.createdAt), // Cursor is oldest msg date
        sendMessage,
        sendTyping,
        typingUsers: Array.from(typingUsers)
    };
};

// Check online status
export const usePresence = (userId) => {
    const { onlineUsers } = useSocket();
    return onlineUsers.has(userId);
};
