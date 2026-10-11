import { useEffect, useState } from 'react';
import { Outlet } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import Navbar from './components/Navbar_page/Navbar.jsx';
import BottomNav from './components/Navbar_page/BottomNav.jsx';
import Skeleton from './components/common/Skeleton';
import InAppNotification from './components/common/InAppNotification';
import { useAuth } from './context/AuthContext';
import { useSocket } from './context/SocketContext';
import { sendDeviceNotification } from './hooks/usePushNotification';
import { Navigate, useLocation } from './shims/router';
import { hasShownNotification, markNotificationShown } from './utils/notificationManager';

// Loading Fallback with Skeleton Layout (from the original App.jsx)
const PageLoader = () => (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
        <div className="h-16 bg-white border-b border-gray-200 w-full fixed top-0 z-50 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Skeleton variant="rectangular" className="h-8 w-8 rounded-full" />
                <Skeleton variant="rectangular" className="h-10 w-64 rounded-xl hidden md:block" />
            </div>
            <div className="flex items-center gap-4">
                <Skeleton variant="circular" className="h-10 w-10" />
                <Skeleton variant="circular" className="h-10 w-10" />
            </div>
        </div>
        <main className="pt-24 pb-16 md:pb-0 px-4 max-w-7xl mx-auto w-full flex gap-6 justify-center">
            <div className="w-full max-w-2xl space-y-6">
                <Skeleton variant="rectangular" className="h-40 w-full rounded-2xl" />
                <Skeleton variant="rectangular" className="h-64 w-full rounded-2xl" />
                <Skeleton variant="rectangular" className="h-64 w-full rounded-2xl" />
            </div>
        </main>
    </div>
);

/** Signed-in app shell: Navbar + page + BottomNav, mirroring the original App.jsx. */
export default function AppLayout() {
    const { currentUser, loading } = useAuth();
    const { socket } = useSocket() || {};
    const location = useLocation();
    const [activeNotification, setActiveNotification] = useState(null);

    const isChatPage = location.pathname.startsWith('/chat');
    const isChatConversation = /^\/chat\/[^/]+$/.test(location.pathname);

    // New screen starts at the top (the phone frame scrolls inside <body> on wide screens).
    useEffect(() => {
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);
    }, [location.pathname]);

    useEffect(() => {
        if (!socket || !currentUser) return;
        const handleNewMessage = (newMessage) => {
            const msgChatId = newMessage.chatId?._id || newMessage.chatId;
            if (window.location.pathname.startsWith(`/chat/${msgChatId}`)) return;
            const senderId = newMessage.senderId?._id || newMessage.senderId;
            if (senderId === currentUser._id) return;
            if (hasShownNotification(newMessage._id)) return;
            markNotificationShown(newMessage._id);
            setActiveNotification({
                id: newMessage._id,
                senderName: newMessage.senderId?.name,
                message: newMessage.text,
                profilePic: newMessage.senderId?.profilePic,
                chatId: msgChatId,
            });
            setTimeout(() => setActiveNotification(null), 4500);
        };
        const handleTeamFound = (data) => {
            toast.success(
                <div className="cursor-pointer">
                    <b>Team Found!</b>
                    <p className="text-sm">You have been matched into "{data.name}". Click to chat!</p>
                </div>,
                { duration: 6000, icon: 'ðŸŽ‰' }
            );
        };
        socket.on('message:new', handleNewMessage);
        socket.on('team:found', handleTeamFound);
        return () => {
            socket.off('message:new', handleNewMessage);
            socket.off('team:found', handleTeamFound);
        };
    }, [socket, currentUser]);

    if (loading) return <PageLoader />;
    if (!currentUser) return <Navigate to="/login" replace />;
    if (!currentUser.isEmailVerified) return <Navigate to="/verify-email" replace state={{ email: currentUser.email }} />;
    if (currentUser.onboarded === false) return <Navigate to="/onboarding" replace />;

    return (
        <div className="min-h-[100dvh] bg-gray-50 text-gray-900">
            <div className={isChatPage ? 'hidden md:block' : ''}>
                <Navbar />
            </div>

            <main className={isChatPage ? 'h-screen overflow-hidden' : 'pt-16 pb-16 md:pb-0'}>
                <Outlet />
            </main>

            {!isChatConversation && <BottomNav />}

            {activeNotification && (
                <InAppNotification notification={activeNotification} onDismiss={() => setActiveNotification(null)} />
            )}
        </div>
    );
}

