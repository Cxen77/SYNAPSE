import { useState, useEffect } from 'react';
import { FiGrid, FiUsers, FiCalendar, FiFileText, FiMessageCircle, FiToggleRight, FiClock, FiArrowLeft, FiShield } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import OverviewTab from './OverviewTab';
import UsersTab from './UsersTab';
import EventsTab from './EventsTab';
import PostsTab from './PostsTab';
import ForumsTab from './ForumsTab';
import SettingsTab from './SettingsTab';
import LogsTab from './LogsTab';
import './admin.css';

const tabs = [
    { id: 'overview', label: 'Overview', icon: FiGrid },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'events', label: 'Events', icon: FiCalendar },
    { id: 'posts', label: 'Posts', icon: FiFileText },
    { id: 'forums', label: 'Forums', icon: FiMessageCircle },
    { id: 'settings', label: 'Flags', icon: FiToggleRight },
    { id: 'logs', label: 'Logs', icon: FiClock },
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    // Set body background to match dark theme and prevent white flash on scroll
    useEffect(() => {
        const prev = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#0f172a';
        document.documentElement.style.backgroundColor = '#0f172a';
        return () => {
            document.body.style.backgroundColor = prev;
            document.documentElement.style.backgroundColor = '';
        };
    }, []);

    const renderTab = () => {
        switch (activeTab) {
            case 'overview': return <OverviewTab />;
            case 'users': return <UsersTab />;
            case 'events': return <EventsTab />;
            case 'posts': return <PostsTab />;
            case 'forums': return <ForumsTab />;
            case 'settings': return <SettingsTab />;
            case 'logs': return <LogsTab />;
            default: return <OverviewTab />;
        }
    };

    return (
        <div className="admin-dashboard min-h-screen bg-[#0f172a]">
            {/* Top Bar */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0f172a] backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                            title="Back to Home"
                        >
                            <FiArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <FiShield className="w-4.5 h-4.5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-white leading-tight tracking-tight">Admin</h1>
                                <p className="text-[9px] text-emerald-400/70 uppercase tracking-[0.2em] font-semibold leading-tight">Control Panel</p>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Tabs */}
                    <nav className="hidden md:flex items-center gap-0.5 bg-white/[0.04] rounded-xl p-1 border border-white/[0.04]">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${isActive
                                        ? 'bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/10'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                                        }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* Mobile Tab Bar */}
            <div className="md:hidden flex admin-tabs-scroll overflow-x-auto gap-1 p-2 bg-[#0f172a] border-b border-white/5">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${isActive
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                <div key={activeTab} className="admin-fade-in">
                    {renderTab()}
                </div>
            </main>
        </div>
    );
}
