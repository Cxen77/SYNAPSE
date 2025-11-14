import Navbar from './components/Navbar.jsx';
import Home from './components/Home_page/Home.jsx';
import Teams from './components/Teams.jsx';
import Events from './components/Event_page/Events.jsx';
import Chat from './components/Chat.jsx';
import Profile from './components/Profile.jsx';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/events" element={<Events />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      
    </div>
  );
}

export default App;
