import React, { useState, useEffect, useRef } from 'react';
import Logo from "../../assets/logo.png";
import SearchBar from "./SearchBar";
import NavItem from "./NavItem";
import NotificationDropdown from "../Notifications/NotificationDropdown";
import api from "../../api/axios";

import {
  HiHome,
  HiUserGroup,
  HiCalendar,
  HiChatAlt2,
  HiUserCircle,
  HiCog,
  HiBell
} from "react-icons/hi";

function Navbar() {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    // Optional: Poll every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

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
    fixed top-0 left-0 w-full z-50 border-b border-gray-200 transition-all duration-300">

      {/* Left Section */}
      <div className="flex items-center gap-4">
        <a href="/">
          <img
            src={Logo}
            alt="Synapse Logo"
            className="h-16 w-auto object-contain"
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
          <NavItem to="/events" icon={HiCalendar} label="Events" />
          <NavItem to="/chat" icon={HiChatAlt2} label="Chat" />
        </ul>

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
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Notifications
            </span>
          </button>
          <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        <ul className="hidden md:flex items-center gap-1">
          <NavItem to="/settings" icon={HiCog} label="Settings" />
        </ul>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

        {/* Profile */}
        <NavItem to="/profile" icon={HiUserCircle} label="Me" end />
      </div>
    </nav>
  );
}

export default Navbar;
