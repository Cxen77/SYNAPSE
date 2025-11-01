import { NavLink } from "react-router-dom";
import Logo from "../assets/logo.png";
import { 
  FaSearch, 
  FaHome, 
  FaUsers, 
  FaCalendarAlt, 
  FaCommentDots, 
  FaUserCircle 
} from "react-icons/fa"; 

function Navbar() {
  const linkClass = ({ isActive }) =>
    `flex flex-col items-center w-20 pt-1 transition-all duration-200 relative ${
      isActive
        ? "text-blue-600"
        : "text-gray-600 hover:text-blue-600"
    }`;

  return (
    <nav className="bg-white shadow-sm h-16 px-6 flex items-center justify-between fixed top-0 left-0 w-full z-50 border-b border-gray-200">
      
      {/* Left Section: Logo + Search */}
      <div className="flex items-center gap-4">
       
        <NavLink to="/">
          <img
            src={Logo}
            alt="Synapse Logo"
            className="h-12 w-auto object-contain"
          />
        </NavLink>

        {/* Search Bar */}
        <div className="relative hidden sm:block">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
          />
        </div>
      </div>

      {/* Right Section: Navigation Links + Profile */}
      <div className="flex items-center gap-1">
        <ul className="flex items-center gap-1">
          <li>
            <NavLink className={linkClass} to="/">
              {({ isActive }) => (
                <>
                  <FaHome className="w-5 h-5 mb-1" />
                  <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>Home</span>
                  {isActive && <div className="absolute -bottom-4 left-0 right-0 h-1 bg-blue-600 rounded-t"></div>}
                </>
              )}
            </NavLink>
          </li>

          <li>
            <NavLink className={linkClass} to="/teams">
              {({ isActive }) => (
                <>
                  <FaUsers className="w-5 h-5 mb-1" />
                  <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>Teams</span>
                  {isActive && <div className="absolute -bottom-4 left-0 right-0 h-1 bg-blue-600 rounded-t"></div>}
                </>
              )}
            </NavLink>
          </li>

          <li>
            <NavLink className={linkClass} to="/events">
              {({ isActive }) => (
                <>
                  <FaCalendarAlt className="w-5 h-5 mb-1" />
                  <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>Events</span>
                  {isActive && <div className="absolute -bottom-4 left-0 right-0 h-1 bg-blue-600 rounded-t"></div>}
                </>
              )}
            </NavLink>
          </li>

          <li>
            <NavLink className={linkClass} to="/chat">
              {({ isActive }) => (
                <>
                  <FaCommentDots className="w-5 h-5 mb-1" />
                  <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>Chat</span>
                  {isActive && <div className="absolute -bottom-4 left-0 right-0 h-1 bg-blue-600 rounded-t"></div>}
                </>
              )}
            </NavLink>
          </li>
        </ul>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200 mx-2"></div> 

        {/* Profile */}
        <NavLink className={linkClass} to="/profile">
          {({ isActive }) => (
            <>
              <FaUserCircle className="w-5 h-5 mb-1" />
              <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>Me</span>
              {isActive && <div className="absolute -bottom-4 left-0 right-0 h-1 bg-blue-600 rounded-t"></div>}
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;