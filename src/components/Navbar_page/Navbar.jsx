import Logo from "../../assets/logo.png";
import SearchBar from "./SearchBar";
import NavItem from "./NavItem";

import {
  HiHome,
  HiUserGroup,
  HiCalendar,
  HiChatAlt2,
  HiUserCircle,
  HiCog
} from "react-icons/hi";

function Navbar() {
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

        <SearchBar />
      </div>

      {/* Navigation Items */}
      <div className="flex items-center gap-1">
        <ul className="flex items-center gap-1">
          <NavItem to="/" icon={HiHome} label="Home" />
          <NavItem to="/teams" icon={HiUserGroup} label="Teams" />
          <NavItem to="/events" icon={HiCalendar} label="Events" />
          <NavItem to="/chat" icon={HiChatAlt2} label="Chat" />
          <NavItem to="/settings" icon={HiCog} label="Settings" />
        </ul>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200 mx-2"></div>

        {/* Profile */}
        <NavItem to="/profile" icon={HiUserCircle} label="Me" end />
      </div>
    </nav>
  );
}

export default Navbar;
