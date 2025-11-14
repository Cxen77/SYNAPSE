import Logo from "../../assets/logo.png";
import SearchBar from "./SearchBar";
import NavItem from "./NavItem";

import { 
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaCommentDots,
  FaUserCircle
} from "react-icons/fa";

function Navbar() {
  return (
    <nav className="bg-white shadow-sm h-16 px-6 flex items-center justify-between 
    fixed top-0 left-0 w-full z-50 border-b border-gray-200">

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
          <NavItem to="/" icon={FaHome} label="Home" />
          <NavItem to="/teams" icon={FaUsers} label="Teams" />
          <NavItem to="/events" icon={FaCalendarAlt} label="Events" />
          <NavItem to="/chat" icon={FaCommentDots} label="Chat" />
        </ul>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200 mx-2"></div>

        {/* Profile */}
        <NavItem to="/profile" icon={FaUserCircle} label="Me" />
      </div>
    </nav>
  );
}

export default Navbar;
