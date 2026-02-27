import React from 'react';
import { NavLink } from 'react-router-dom';
import { HiHome, HiUserGroup, HiCalendar, HiChatAlt2, HiCog } from 'react-icons/hi';

import FeatureGate from '../common/FeatureGate';

const BottomNav = () => {
    const navItems = [
        { to: "/", icon: HiHome, label: "Home" },
        { to: "/teams", icon: HiUserGroup, label: "Teams" },
        { to: "/forums", icon: HiChatAlt2, label: "Forums", featureKey: "forum" },
        { to: "/events", icon: HiCalendar, label: "Events", featureKey: "events" },
        { to: "/chat", icon: HiChatAlt2, label: "Chat", featureKey: "chat" },
        { to: "/settings", icon: HiCog, label: "Settings" },
    ];

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-6 py-2 md:hidden z-50 flex justify-between items-center pb-safe">
            {navItems.map((item) => (
                <FeatureGate key={item.to} featureKey={item.featureKey}>
                    <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${isActive
                                ? "text-blue-600 bg-blue-50"
                                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                            }`
                        }
                    >
                        <item.icon className="w-6 h-6" />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </NavLink>
                </FeatureGate>
            ))}
        </div>
    );
};

export default BottomNav;
