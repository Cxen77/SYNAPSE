import { NavLink } from "react-router-dom";

function NavItem({ to, icon: Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center w-20 pt-1 transition-all duration-200 relative ${isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="w-5 h-5 mb-1" />
          <span className={`text-xs ${isActive ? "font-bold" : "font-medium"}`}>
            {label}
          </span>
          {isActive && (
            <div className="absolute -bottom-4 left-0 right-0 h-1 bg-blue-600 rounded-t"></div>
          )}
        </>
      )}
    </NavLink>
  );
}

export default NavItem;
