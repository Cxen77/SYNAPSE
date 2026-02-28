import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from "../../assets/logo.png";
import SearchBar from "./SearchBar";
import NavItem from "./NavItem";
import Avatar from "../common/Avatar";
import NotificationDropdown from "../Notifications/NotificationDropdown";
import api from "../../api/axios";
import { useSocket } from "../../context/SocketContext";
import FeatureGate from "../common/FeatureGate";

import {
  HiHome,
  HiUserGroup,
  HiCalendar,
  HiChatAlt2,
  HiUserCircle,
  HiCog,
  HiBell
} from "react-icons/hi";
import { FiShield } from "react-icons/fi";

function Navbar() {
  const { currentUser } = useAuth();
  const { socket } = useSocket();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    // Optional: Poll every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // Listen for real-time notifications to update badge
  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (notif) => {
      setUnreadCount(prev => prev + 1);
    };
    socket.on('notification:new', handleNewNotification);
    return () => socket.off('notification:new', handleNewNotification);
  }, [socket]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications');
      const unread = data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const toggleNotifications = () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen) {
      // Refresh count when opening
      fetchUnreadCount();
    }
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm h-16 px-6 flex items-center justify-between 
    fixed top-0 left-0 w-full z-[100] border-b border-gray-200 transition-all duration-300">

      {/* Left Section */}
      <div className="flex items-center gap-4">
        <a href="/">
          <img
            src={Logo}
            alt="Fuseon Logo"
            className="h-12 w-auto object-contain"
          />
        </a>

        <div className="hidden md:block">
          <SearchBar />
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex items-center gap-1">
        {/* Desktop Nav Items */}
        <ul className="hidden md:flex items-center gap-1">
          <NavItem to="/" icon={HiHome} label="Home" />
          <NavItem to="/teams" icon={HiUserGroup} label="Teams" />
          <FeatureGate featureKey="forum"><NavItem to="/forums" icon={HiChatAlt2} label="Forums" /></FeatureGate>
          <FeatureGate featureKey="events"><NavItem to="/events" icon={HiCalendar} label="Events" /></FeatureGate>
          <FeatureGate featureKey="chat"><NavItem to="/chat" icon={HiChatAlt2} label="Chat" /></FeatureGate>
          <NavItem to="/settings" icon={HiCog} label="Settings" />

          {/* Admin Panel Link */}
          {currentUser?.role === 'admin' && (
            <NavItem to="/admin" icon={FiShield} label="Admin" />
          )}

          {/* Moderator Panel Link */}
          {currentUser?.role === 'moderator' && (
            <NavItem to="/admin" icon={FiShield} label="Mod Panel" />
          )}

          {/* Organizer Panel Link */}
          {currentUser?.role === 'organizer' && (
            <NavItem to="/admin" icon={FiShield} label="Organizer Panel" />
          )}
        </ul>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200 mx-3 hidden md:block"></div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={toggleNotifications}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-all duration-200 relative group"
            >
              <HiBell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
              {/* Tooltip */}
              <span className="hidden md:block absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                Notifications
              </span>
            </button>
            <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
          </div>

          {/* Profile Picture */}
          <Link to="/profile">
            <Avatar
              src={currentUser?.profilePic}
              alt={currentUser?.name || "User"}
              size="sm"
              className="ring-2 ring-gray-100 hover:ring-blue-100 transition-all cursor-pointer"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
