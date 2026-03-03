import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiList, FiMessageSquare, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import OverviewTab from '../Admin_page/OverviewTab';
import EventsTab from '../Admin_page/EventsTab';
import PostsTab from '../Admin_page/PostsTab';
import UsersTab from '../Admin_page/UsersTab';

export default function ModeratorDashboard() {
    const { logout, currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('posts');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const tabs = [
        { id: 'posts', label: 'Posts', icon: FiMessageSquare, component: PostsTab },
        { id: 'events', label: 'Events', icon: FiList, component: EventsTab },
        { id: 'users', label: 'Users', icon: FiGrid, component: UsersTab },
    ];

    const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || PostsTab;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex font-sans">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={`fixed lg:sticky top-[64px] h-[calc(100vh-64px)] w-64 bg-white border-r border-gray-200 flex flex-col z-40 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-200 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="font-bold text-white">M</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-base leading-tight text-gray-900">Moderator</h1>
                            <p className="text-xs text-gray-400">Panel</p>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                        <FiX size={18} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar">
                    <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 mt-1">Content Moderation</p>
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group border ${isActive
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 border-transparent'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-700'}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 shrink-0">
                    <div className="flex items-center gap-3 mb-3 px-1">
                        <img
                            src={currentUser?.profilePic || `https://ui-avatars.com/api/?name=${currentUser?.name}&background=random`}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{currentUser?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <FiLogOut size={14} /> Sign Out
                    </button>
                </div>
            </motion.aside>

            {/* Main */}
            <main className="flex-1 min-w-0 bg-gray-50 flex flex-col" style={{ minHeight: '100vh', paddingTop: '64px', overflowX: 'hidden' }}>
                {/* Mobile Top Bar */}
                <div className="lg:hidden sticky top-[64px] z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-1 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                            <FiMenu size={20} />
                        </button>
                        <span className="font-bold text-gray-900">Moderator Panel</span>
                    </div>
                </div>

                <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full min-h-full">
                    <ActiveComponent />
                </div>
            </main>
        </div>
    );
}
