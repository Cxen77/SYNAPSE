import Navbar from './components/Navbar_page/Navbar.jsx';
import Home from './components/Home_page/Home.jsx';
import Teams from './components/Team_page/Teams.jsx';
import Events from './components/Event_page/Events.jsx';
import EventDetails from './components/Event_page/EventDetails.jsx';
import Chat from './components/Chat_page/Chat.jsx';
import Profile from './components/Profile_page/Profile.jsx';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import Settings from './components/Settings_page/Settings.jsx';
import VerifyEmail from './components/VerifyEmail.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import ForumLayout from './components/Forum_page/ForumLayout.jsx';
import ForumHome from './components/Forum_page/ForumHome.jsx';
import ForumDetails from './components/Forum_page/ForumDetails.jsx';
import BottomNav from './components/Navbar_page/BottomNav.jsx';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        {!isAuthPage && <Navbar />}

        <main className={!isAuthPage ? "pt-16 pb-16 md:pb-0" : ""}>
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
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Forum Routes */}
            <Route path="/forums" element={<ProtectedRoute><ForumLayout /></ProtectedRoute>}>
              <Route index element={<ForumHome />} />
              <Route path=":id" element={<ForumDetails />} />
            </Route>
          </Routes>
        </main>

      </div>
      {!isAuthPage && <BottomNav />}
    </AuthProvider>
  );
}

export default App;
