import { NavLink } from "react-router-dom";
import Logo from "../assets/logo.png";
// Import all the new icons we need
import { 
  FaSearch, 
  FaHome, 
  FaUsers, 
  FaCalendarAlt, 
  FaCommentDots, 
  FaUserCircle 
} from "react-icons/fa"; 

function Navbar() {
  
  // This function provides the styling for the icon-based links
  const linkClass = ({ isActive }) =>
    `flex flex-col items-center w-20 pt-1 transition-colors duration-200 relative ${
      isActive
        ? "text-gray-900" // Active link color
        : "text-gray-500 hover:text-gray-900" // Inactive link color
    }`;

  return (
    <nav className="bg-white shadow-md h-16 px-6 flex items-center justify-between fixed top-0 left-0 w-full z-50">
      
      {/* 1. Left Section: Logo + Search */}
      <div className="flex items-center gap-2">
        <NavLink to="/">
          <img
            src={Logo}
            alt="Synapse Logo"
            className="h-10 w-auto object-contain"
          />
        </NavLink>
        
        {/* New Search Bar */}
        <div className="relative hidden sm:block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FaSearch />
          </span>
          <input 
            type="text" 
            placeholder="Search" 
            className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* 2. Right Section: Nav Links + Profile */}
      <div className="flex items-center">
        {/* Main Nav Links */}
        <ul className="flex">
          <li>
            <NavLink className={linkClass} to="/">
              {({ isActive }) => (
                <>
                  <FaHome className="w-6 h-6" />
                  <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>Home</span>
                  {isActive && <div className="absolute -bottom-3 h-0.5 w-full bg-gray-900"></div>}
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink className={linkClass} to="/teams">
              {({ isActive }) => (
                <>
                  <FaUsers className="w-6 h-6" />
                  <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>Teams</span>
                  {isActive && <div className="absolute -bottom-3 h-0.5 w-full bg-gray-900"></div>}
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink className={linkClass} to="/events">
              {({ isActive }) => (
                <>
                  <FaCalendarAlt className="w-6 h-6" />
                  <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>Events</span>
                  {isActive && <div className="absolute -bottom-3 h-0.5 w-full bg-gray-900"></div>}
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink className={linkClass} to="/chat">
              {({ isActive }) => (
                <>
                  <FaCommentDots className="w-6 h-6" />
                  <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>Chat</span>
                  {isActive && <div className="absolute -bottom-3 h-0.5 w-full bg-gray-900"></div>}
                </>
              )}
            </NavLink>
          </li>
        </ul>

        {/* Vertical Divider */}
        <div className="h-10 w-px bg-gray-200 mx-2"></div> 

        {/* Profile Link */}
        <NavLink className={linkClass} to="/profile">
          {({ isActive }) => (
            <>
              <FaUserCircle className="w-6 h-6" />
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>Me</span>
              {isActive && <div className="absolute -bottom-3 h-0.5 w-full bg-gray-900"></div>}
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;