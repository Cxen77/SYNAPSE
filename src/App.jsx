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
const Events = lazy(() => import('./components/Event_page/Events.jsx'));
const EventDetails = lazy(() => import('./components/Event_page/EventDetails.jsx'));
const Chat = lazy(() => import('./components/Chat_page/Chat.jsx'));
const Profile = lazy(() => import('./components/Profile_page/Profile.jsx'));
const Login = lazy(() => import('./components/Login.jsx'));
const Signup = lazy(() => import('./components/Signup.jsx'));
const Settings = lazy(() => import('./components/Settings_page/Settings.jsx'));
const VerifyEmail = lazy(() => import('./components/VerifyEmail.jsx'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword.jsx'));
const ForumLayout = lazy(() => import('./components/Forum_page/ForumLayout.jsx'));
const ForumHome = lazy(() => import('./components/Forum_page/ForumHome.jsx'));
const ForumDetails = lazy(() => import('./components/Forum_page/ForumDetails.jsx'));
const ThreadPage = lazy(() => import('./components/Forum_page/ThreadPage.jsx'));

import Skeleton from './components/common/Skeleton';

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

  if (!currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

function App() {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup', '/verify-email', '/forgot-password'].includes(location.pathname);
  const isChatPage = location.pathname.startsWith('/chat');
  const isChatConversation = location.pathname.match(/^\/chat\/[^/]+$/);

  return (
    <AuthProvider>
      <SocketProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
          {!isAuthPage && (
            <div className={isChatPage ? "hidden md:block" : ""}>
              <Navbar />
            </div>
          )}

          <main className={
            isAuthPage ? "" :
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

                {/* Protected Routes */}
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
                <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
                <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                {/* Forum Routes */}
                <Route path="/forums" element={<ProtectedRoute><ForumLayout /></ProtectedRoute>}>
                  <Route index element={<ForumHome />} />
                  <Route path="post/:id" element={<ThreadPage />} />
                  <Route path=":id" element={<ForumDetails />} />
                </Route>
              </Routes>
            </Suspense>
          </main>

        </div>
        {!isAuthPage && !isChatConversation && <BottomNav />}
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
