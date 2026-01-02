import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    User,
    Shield,
    Bell,
    Eye,
    AlertTriangle,
    LogOut,
    Briefcase,
    Zap,
    Monitor,
    ChevronRight,
    Menu
} from 'lucide-react';
import { ToastProvider } from '../common/Toast';
import AccountSettings from './sections/AccountSettings';
import ProfileSettings from './sections/ProfileSettings';
import PrivacySettings from './sections/PrivacySettings';
import NotificationSettings from './sections/NotificationSettings';
import AutoTeamSettings from './sections/AutoTeamSettings';
import InterfaceSettings from './sections/InterfaceSettings';
import { SecuritySettings, DangerZone } from './sections/SecuritySettings';

const Settings = () => {
    const { currentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Parse query param or default to 'account'
    const getInitialSection = () => {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get('section') || 'account';
    };

    const [activeSection, setActiveSection] = useState(getInitialSection());
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMobileMenu, setShowMobileMenu] = useState(true);

    // Sync state with URL
    useEffect(() => {
        const section = getInitialSection();
        if (section !== activeSection) {
            setActiveSection(section);
        }
    }, [location.search]);

    // Update URL when section changes
    const handleSectionChange = (sectionId) => {
        navigate(`?section=${sectionId}`, { replace: true });
        setActiveSection(sectionId);
        setShowMobileMenu(false); // Close menu on mobile selection
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/users/profile');
                setUser(data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
                if (currentUser) {
                    setUser({
                        name: currentUser.displayName,
                        email: currentUser.email,
                        username: currentUser.email?.split('@')[0],
                        profilePic: currentUser.photoURL,
                        bio: "Welcome to your settings!",
                        socials: {},
                        settings: {}
                    });
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            navigate('/login');
        } catch (err) {
            console.error("Logout failed", err);
            navigate('/login');
        }
    };

    const menuItems = [
        {
            id: 'account',
            label: 'Account',
            icon: User,
            description: "Manage your personal account information."
        },
        {
            id: 'profile',
            label: 'Profile',
            icon: Briefcase,
            description: "Customize how others see you on Synapse."
        },
        {
            id: 'privacy',
            label: 'Privacy',
            icon: Eye,
            description: "Control who can see your profile and contact you."
        },
        {
            id: 'notifications',
            label: 'Notifications',
            icon: Bell,
            description: "Manage how you receive updates and alerts."
        },
        {
            id: 'autoteam',
            label: 'Auto-Team',
            icon: Zap,
            description: "Configure matchmaking preferences for teams.",
            badge: "New"
        },
        {
            id: 'interface',
            label: 'Interface',
            icon: Monitor,
            description: "Customize your app experience."
        },
        {
            id: 'security',
            label: 'Security',
            icon: Shield,
            description: "Keep your account safe and secure."
        },
        {
            id: 'danger',
            label: 'Danger Zone',
            icon: AlertTriangle,
            className: 'text-red-500 hover:bg-red-50',
            activeClassName: 'bg-red-50 text-red-600 border-l-4 border-red-500',
            description: "Irreversible and destructive actions."
        },
    ];

    const activeItem = menuItems.find(item => item.id === activeSection);

    const renderSection = () => {
        if (loading) return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
        if (!user) return <div className="p-8 text-center text-gray-500">Failed to load user data.</div>;

        switch (activeSection) {
            case 'account': return <AccountSettings user={user} setUser={setUser} />;
            case 'profile': return <ProfileSettings user={user} setUser={setUser} />;
            case 'privacy': return <PrivacySettings user={user} setUser={setUser} />;
            case 'notifications': return <NotificationSettings user={user} setUser={setUser} />;
            case 'autoteam': return <AutoTeamSettings user={user} setUser={setUser} />;
            case 'interface': return <InterfaceSettings user={user} setUser={setUser} />;
            case 'security': return <SecuritySettings />;
            case 'danger': return <DangerZone />;
            default: return <AccountSettings user={user} setUser={setUser} />;
        }
    };

    return (
        <ToastProvider>
            <div className="h-[calc(100vh-4rem)] bg-gray-50 pt-0 md:pt-6 pb-0 md:pb-6 px-0 md:px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="max-w-7xl mx-auto h-full flex flex-col">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6 flex-shrink-0 hidden md:block px-4 md:px-0">Settings</h1>

                    <div className="flex flex-col md:flex-row gap-6 h-full overflow-hidden">
                        {/* Sidebar */}
                        <div className={`${showMobileMenu ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} fixed md:static top-16 bottom-[4.5rem] inset-x-0 md:inset-auto z-40 bg-white md:bg-transparent transition-transform duration-300 ease-in-out md:flex w-full md:w-72 flex-shrink-0 flex-col md:rounded-2xl shadow-none md:shadow-sm border-b md:border border-gray-100 overflow-hidden h-[calc(100%-4rem-4.5rem)] md:h-full`}>
                            <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10 flex items-center justify-between md:hidden">
                                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                                <button onClick={() => setShowMobileMenu(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="md:bg-white md:rounded-2xl md:shadow-sm md:border md:border-gray-100 h-full flex flex-col">
                                <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                                    {menuItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSectionChange(item.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group ${activeSection === item.id
                                                ? item.activeClassName || 'bg-blue-50 text-blue-700 shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                } ${item.className || ''}`}
                                        >
                                            <div className={`p-1.5 rounded-lg transition-colors ${activeSection === item.id ? 'bg-white/80' : 'bg-gray-100 group-hover:bg-white'}`}>
                                                <item.icon size={18} strokeWidth={2} />
                                            </div>
                                            <span className="flex-1 text-left">{item.label}</span>
                                            {item.badge && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-full tracking-wider">{item.badge}</span>}
                                            {activeSection === item.id && <ChevronRight size={16} className="text-blue-400" />}
                                        </button>
                                    ))}
                                </nav>
                                <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-white hover:text-red-600 hover:shadow-sm transition-all duration-200"
                                    >
                                        <LogOut size={18} />
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className={`flex flex-1 bg-white md:rounded-2xl shadow-none md:shadow-sm border-b md:border border-gray-100 overflow-hidden flex-col h-full fixed inset-0 top-16 bottom-[4.5rem] md:static z-20 transition-opacity duration-300 ${showMobileMenu ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto' : 'opacity-100'}`}>
                            {/* Mobile Header */}
                            <div className="px-4 py-4 md:hidden bg-white border-b border-gray-100 flex items-center gap-3 sticky top-0 z-10">
                                <button
                                    onClick={() => setShowMobileMenu(true)}
                                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
                                >
                                    <Menu size={24} />
                                </button>
                                <span className="font-bold text-lg text-gray-900">{activeItem?.label}</span>
                            </div>

                            {/* Desktop Header */}
                            <div className="hidden md:flex px-8 py-6 border-b border-gray-100 items-center justify-between bg-white">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                        {activeItem?.label || 'Settings'}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {activeItem?.description || 'Manage your settings'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar scroll-smooth">
                                <div className="max-w-3xl mx-auto md:mx-0">
                                    {renderSection()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ToastProvider>
    );
};

export default Settings;
