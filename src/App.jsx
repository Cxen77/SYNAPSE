import { Suspense, lazy } from 'react';
import Navbar from './components/Navbar_page/Navbar.jsx';
import BottomNav from './components/Navbar_page/BottomNav.jsx';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Lazy Load Components
const Home = lazy(() => import('./components/Home_page/Home.jsx'));
const Teams = lazy(() => import('./components/Team_page/Teams.jsx'));
const TeamDetails = lazy(() => import('./components/Team_page/TeamDetails.jsx'));
const ManageTeam = lazy(() => import('./components/Team_page/ManageTeam.jsx'));
const Events = lazy(() => import('./components/Event_page/Events.jsx'));
const EventDetails = lazy(() => import('./components/Event_page/EventDetails.jsx'));
const Chat = lazy(() => import('./components/Chat_page/Chat.jsx'));
const Profile = lazy(() => import('./components/Profile_page/Profile.jsx'));
const Login = lazy(() => import('./components/Login.jsx'));
const Signup = lazy(() => import('./components/Signup.jsx'));
const Settings = lazy(() => import('./components/Settings_page/Settings.jsx'));
const VerifyEmail = lazy(() => import('./components/VerifyEmail.jsx'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./components/ResetPassword.jsx'));
const ForumLayout = lazy(() => import('./components/Forum_page/ForumLayout.jsx'));
const ForumHome = lazy(() => import('./components/Forum_page/ForumHome.jsx'));
const ForumDetails = lazy(() => import('./components/Forum_page/ForumDetails.jsx'));
const ThreadPage = lazy(() => import('./components/Forum_page/ThreadPage.jsx'));
const AdminDashboard = lazy(() => import('./components/Admin_page/AdminDashboard.jsx'));
const ModeratorDashboard = lazy(() => import('./components/Moderator_page/ModeratorDashboard.jsx'));
const OrganizerDashboard = lazy(() => import('./components/Organizer_page/OrganizerDashboard.jsx'));
const Unauthorized = lazy(() => import('./components/Unauthorized.jsx'));

// ... existing imports ...



import Skeleton from './components/common/Skeleton';
import InAppNotification from './components/common/InAppNotification';
import FeatureGate from './components/common/FeatureGate';

// Loading Fallback with Skeleton Layout
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    {/* Navbar Skeleton */}
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

    {/* Content Skeleton */}
    <main className="pt-24 pb-16 md:pb-0 px-4 max-w-7xl mx-auto w-full flex gap-6 justify-center">
      {/* Feed/Main Content Area */}
      <div className="w-full max-w-2xl space-y-6">
        <Skeleton variant="rectangular" className="h-40 w-full rounded-2xl" />
        <Skeleton variant="rectangular" className="h-64 w-full rounded-2xl" />
        <Skeleton variant="rectangular" className="h-64 w-full rounded-2xl" />
      </div>
    </main>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!currentUser.isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

import RoleRoute from './components/RoleRoute';

import usePushNotification from './hooks/usePushNotification';
import useNotifications from './hooks/useNotifications';
import { useSocket } from './context/SocketContext';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { hasShownNotification, markNotificationShown } from './utils/notificationManager';

function App() {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup', '/verify-email', '/forgot-password', '/reset-password'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');
  const isChatPage = location.pathname.startsWith('/chat');
  const isChatConversation = location.pathname.match(/^\/chat\/[^/]+$/);

  // Push Notifications (FCM)
  usePushNotification();

  // In-App Notifications
  useNotifications();
  const { socket } = useSocket();
  const { currentUser } = useAuth();

  // State for in-app notifications
  const [activeNotification, setActiveNotification] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      const currentPath = window.location.pathname;
      const msgChatId = newMessage.chatId._id || newMessage.chatId;
      const messageId = newMessage._id;

      // Check if we are in the specific chat
      const isChatActive = currentPath.startsWith(`/chat/${msgChatId}`);

      if (!isChatActive) {
        // Prevent self-notification
        if (newMessage.senderId._id === currentUser._id || newMessage.senderId === currentUser._id) {
          return;
        }

        // DEDUPLICATION: Check if we've already shown this notification
        if (hasShownNotification(messageId)) {
          console.log('[App] Skipping duplicate notification for message:', messageId);
          return;
        }

        // Mark as shown BEFORE displaying to prevent race conditions
        markNotificationShown(messageId);

        // Show Instagram-style notification
        setActiveNotification({
          id: messageId,
          senderName: newMessage.senderId.name,
          message: newMessage.text,
          profilePic: newMessage.senderId.profilePic,
          chatId: msgChatId
        });

        // Auto-dismiss after showing
        setTimeout(() => {
          setActiveNotification(null);
        }, 4500);
      }
    };

    socket.on('message:new', handleNewMessage);

    // Auto Team Match Listener
    socket.on('team:found', (data) => {
      // console.log('[App] Auto Team Matched!', data);
      toast.success(
        <div onClick={() => window.location.href = `/chat/${data.chatId}`} className="cursor-pointer">
          <b>Team Found!</b>
          <p className="text-sm">You have been matched into "{data.name}". Click to chat!</p>
        </div>,
        { duration: 6000, icon: '🎉' }
      );
      // Optional: Auto redirect after delay or immediately?
      // window.location.href = `/chat/${data.chatId}`; 
    });

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('team:found');
    };
  }, [socket, currentUser]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} containerStyle={{ zIndex: 99999 }} />
      {!isAuthPage && !isAdminPage && (
        <div className={isChatPage ? "hidden md:block" : ""}>
          <Navbar />
        </div>
      )}

      <main className={
        isAuthPage || isAdminPage ? "" :
          isChatPage ? "h-screen overflow-hidden" :
            "pt-16 pb-16 md:pb-0"
      }>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
            <Route path="/teams/:id" element={<ProtectedRoute><TeamDetails /></ProtectedRoute>} />
            <Route path="/teams/:id/manage" element={<ProtectedRoute><ManageTeam /></ProtectedRoute>} />

            {/* Feature Gated Routes */}
            <Route path="/events" element={<ProtectedRoute><FeatureGate featureKey="events" fallback={<Navigate to="/" replace />}><Events /></FeatureGate></ProtectedRoute>} />
            <Route path="/events/:id" element={<ProtectedRoute><FeatureGate featureKey="events" fallback={<Navigate to="/" replace />}><EventDetails /></FeatureGate></ProtectedRoute>} />

            <Route path="/chat" element={<ProtectedRoute><FeatureGate featureKey="chat" fallback={<Navigate to="/" replace />}><Chat /></FeatureGate></ProtectedRoute>} />
            <Route path="/chat/:id" element={<ProtectedRoute><FeatureGate featureKey="chat" fallback={<Navigate to="/" replace />}><Chat /></FeatureGate></ProtectedRoute>} />

            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Admin Route - Strict List */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Moderator Route - Strict List */}
            <Route
              path="/moderator/*"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['moderator']}>
                    <ModeratorDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Organizer Route - Strict List */}
            <Route
              path="/organizer/*"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['organizer']}>
                    <OrganizerDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Forum Routes (Feature Gated) */}
            <Route path="/forums" element={<ProtectedRoute><FeatureGate featureKey="forum" fallback={<Navigate to="/" replace />}><ForumLayout /></FeatureGate></ProtectedRoute>}>
              <Route index element={<ForumHome />} />
              <Route path="post/:id" element={<ThreadPage />} />
              <Route path=":id" element={<ForumDetails />} />
            </Route>
          </Routes>
        </Suspense>
      </main>

      {!isAuthPage && !isAdminPage && !isChatConversation && <BottomNav />}

      {/* Instagram-style in-app notification */}
      {activeNotification && (
        <InAppNotification
          notification={activeNotification}
          onDismiss={() => setActiveNotification(null)}
        />
      )}
    </div>
  );
}

export default App;
