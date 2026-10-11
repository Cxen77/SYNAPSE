import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_URL } from '../api/client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [activeNotification, setActiveNotification] = useState(null);
  const { currentUser, token } = useAuth();

  useEffect(() => {
    let newSocket;

    if (currentUser && token) {
      newSocket = io(SOCKET_URL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        // console.log('[Mobile Socket] Connected:', newSocket.id);
      });

      newSocket.on('online:users', (userIds) => {
        setOnlineUsers(new Set(userIds));
      });

      newSocket.on('user:presence', ({ userId, status }) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          if (status === 'online') next.add(userId);
          else next.delete(userId);
          return next;
        });
      });

      newSocket.on('message:new', (msg) => {
        // In-app banner for new message
        if (msg.senderId?._id !== currentUser._id) {
          setActiveNotification({
            id: msg._id,
            title: msg.senderId?.name || 'New Message',
            body: msg.text || 'Sent an attachment',
            avatar: msg.senderId?.profilePic,
            chatId: msg.chatId?._id || msg.chatId,
          });
          setTimeout(() => setActiveNotification(null), 4000);
        }
      });

      newSocket.on('team:found', (data) => {
        setActiveNotification({
          id: Date.now(),
          title: '🎉 Team Found!',
          body: `You've been matched into "${data.name}"`,
          chatId: data.chatId,
        });
        setTimeout(() => setActiveNotification(null), 6000);
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [currentUser, token]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        activeNotification,
        dismissNotification: () => setActiveNotification(null),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
