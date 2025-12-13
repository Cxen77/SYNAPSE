import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const { currentUser } = useAuth();

    useEffect(() => {
        let newSocket;

        const initSocket = async () => {
            if (currentUser) {
                const token = await currentUser.getIdToken();

                // For development, assume localhost:5000. In prod, use env var.
                const SERVER_URL = 'http://localhost:5000';

                newSocket = io(SERVER_URL, {
                    auth: { token },
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000
                });

                newSocket.on('connect', () => {
                    console.log('[Socket] Connected:', newSocket.id);
                });

                newSocket.on('disconnect', (reason) => {
                    console.log('[Socket] Disconnected:', reason);
                });

                newSocket.on('connect_error', (err) => {
                    console.error('[Socket] Connection error:', err.message);
                });

                newSocket.on('user:presence', ({ userId, status }) => {
                    setOnlineUsers(prev => {
                        const newSet = new Set(prev);
                        if (status === 'online') {
                            newSet.add(userId);
                        } else {
                            newSet.delete(userId);
                        }
                        return newSet;
                    });
                });

                setSocket(newSocket);
            }
        };

        if (currentUser) {
            initSocket();
        }

        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, [currentUser]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
