import Navbar from './components/Navbar_page/Navbar.jsx';
import Home from './components/Home_page/Home.jsx';
import Teams from './components/Team_page/Teams.jsx';
import Events from './components/Event_page/Events.jsx';
import Chat from './components/Chat_page/Chat.jsx';
import Profile from './components/Profile_page/Profile.jsx';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import Settings from './components/Settings_page/Settings.jsx';
import { Routes, Route, useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {!isAuthPage && <Navbar />}

      <main className={!isAuthPage ? "pt-16" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/events" element={<Events />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

    </div>
  );
}

export default App;
