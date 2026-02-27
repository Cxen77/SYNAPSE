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

    // Reuse admin tabs but strictly limit to allowed Moderator functions
    // Note: Overview is hidden as it requests /admin which we didn't explicitly allow moderators to hit if it contains global data they shouldn't see? Actually we did allow them on `/` in adminRoutes.
    // However, the prompt specifically requested: "Tabs: Posts, Events, Users".
    const tabs = [
        { id: 'posts', label: 'Posts', icon: FiMessageSquare, component: PostsTab },
        { id: 'events', label: 'Events', icon: FiList, component: EventsTab },
        { id: 'users', label: 'Users', icon: FiGrid, component: UsersTab },
    ];

    const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || PostsTab;

    return (
        <div className="min-h-screen bg-slate-900 text-white flex font-sans selection:bg-indigo-500/30">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={`fixed lg:sticky top-[64px] h-[calc(100vh-64px)] w-72 bg-slate-900 border-r border-white/5 flex flex-col z-40 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="font-bold text-lg">M</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">Moderator</h1>
                            <p className="text-xs text-slate-500">Panel</p>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Content Moderation</p>
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-white/5 bg-slate-900/50">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <img
                            src={currentUser?.profilePic || `https://ui-avatars.com/api/?name=${currentUser?.name}&background=random`}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium"
                    >
                        <FiLogOut /> Sign Out
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 bg-slate-950 relative" style={{ minHeight: '100vh', paddingTop: '64px', overflowX: 'hidden' }}>
                <div className="lg:hidden sticky top-[64px] z-30 bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg">
                            <FiMenu size={20} />
                        </button>
                        <span className="font-bold text-white">Moderator Panel</span>
                    </div>
                </div>

                <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-full">
                    <ActiveComponent />
                </div>
            </main>
        </div>
    );
}
