import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
    User,
    Shield,
    Bell,
    Eye,
    AlertTriangle,
    LogOut,
    Github,
    Linkedin,
    Twitter,
    Instagram,
    Briefcase,
    Camera,
    Mail,
    Key,
    Smartphone,
    Globe
} from 'lucide-react';

const Settings = () => {
    const [activeSection, setActiveSection] = useState('account');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/users/profile');
                setUser(data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

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
        { id: 'account', label: 'Account', icon: User },
        { id: 'profile', label: 'Profile', icon: Briefcase },
        { id: 'privacy', label: 'Privacy', icon: Eye },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, className: 'text-red-500 hover:bg-red-50' },
    ];

    const renderSection = () => {
        if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
        if (!user) return <div className="p-8 text-center text-gray-500">Failed to load user data.</div>;

        switch (activeSection) {
            case 'account':
                return <AccountSettings user={user} setUser={setUser} />;
            case 'profile':
                return <ProfileSettings user={user} setUser={setUser} />;
            case 'privacy':
                return <PrivacySettings user={user} setUser={setUser} />;
            case 'notifications':
                return <NotificationSettings user={user} setUser={setUser} />;
            case 'security':
                return <SecuritySettings />;
            case 'danger':
                return <DangerZone />;
            default:
                return <AccountSettings user={user} setUser={setUser} />;
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] bg-gray-50 pt-6 pb-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="max-w-6xl mx-auto h-full flex flex-col">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 flex-shrink-0">Settings</h1>

                <div className="flex flex-col md:flex-row gap-6 h-full overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 flex-shrink-0 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeSection === item.id
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        } ${item.className || ''}`}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        <div className="p-2 border-t border-gray-100">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                            >
                                <LogOut size={18} />
                                Log Out
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                            {renderSection()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Section Components

const AccountSettings = ({ user, setUser }) => {
    const [formData, setFormData] = useState({
        name: user.name || '',
        username: user.username || '',
        email: user.email || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            const { data } = await api.put('/users/profile', formData);
            setUser(data);
            alert("Account updated successfully!");
        } catch (err) {
            console.error("Failed to update account", err);
            alert("Failed to update account.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 max-w-3xl">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Account Settings</h2>
                <p className="text-sm text-gray-500">Manage your personal account information.</p>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <div className="flex gap-4">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                        <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                            Verify
                        </button>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleUpdate}
                        disabled={isSaving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Password & Authentication</h3>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200">
                        <Key size={16} />
                        Change Password
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProfileSettings = ({ user, setUser }) => {
    const [formData, setFormData] = useState({
        bio: user.bio || '',
        course: user.course || '',
        year: user.year || 'Freshman',
        skills: user.skills || [],
        socials: {
            github: user.socials?.github || '',
            linkedin: user.socials?.linkedin || '',
            twitter: user.socials?.twitter || '',
            instagram: user.socials?.instagram || '',
            website: user.socials?.website || ''
        }
    });
    const [newSkill, setNewSkill] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSocialChange = (e) => {
        setFormData({
            ...formData,
            socials: { ...formData.socials, [e.target.name]: e.target.value }
        });
    };

    const addSkill = (e) => {
        if (e.key === 'Enter' && newSkill.trim()) {
            e.preventDefault();
            if (!formData.skills.includes(newSkill.trim())) {
                setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
            }
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(skill => skill !== skillToRemove)
        });
    };

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            const { data } = await api.put('/users/profile', formData);
            setUser(data);
            alert("Profile updated successfully!");
        } catch (err) {
            console.error("Failed to update profile", err);
            alert("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 max-w-3xl">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Profile Settings</h2>
                <p className="text-sm text-gray-500">Customize how others see you on Synapse.</p>
            </div>

            {/* Banner & Avatar */}
            <div className="relative mb-12 group">
                <div className="h-32 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-xl overflow-hidden">
                    {user.bannerPic && (
                        <img src={user.bannerPic} alt="Banner" className="w-full h-full object-cover" />
                    )}
                    <button className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                        <Camera size={18} />
                    </button>
                </div>
                <div className="absolute -bottom-10 left-6">
                    <div className="relative">
                        <img
                            src={user.profilePic || "https://via.placeholder.com/150"}
                            alt="Profile"
                            className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white object-cover"
                        />
                        <button className="absolute bottom-0 right-0 bg-gray-900 text-white p-1.5 rounded-full hover:bg-gray-700 transition-colors border-2 border-white">
                            <Camera size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6 pt-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                        rows="3"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself..."
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Course / Major</label>
                        <input
                            type="text"
                            name="course"
                            value={formData.course}
                            onChange={handleChange}
                            placeholder="e.g. Computer Science"
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Year</label>
                        <select
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                        >
                            <option>Freshman</option>
                            <option>Sophomore</option>
                            <option>Junior</option>
                            <option>Senior</option>
                            <option>Graduate</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Skills</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {formData.skills.map((skill) => (
                            <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium flex items-center gap-1">
                                {skill}
                                <button onClick={() => removeSkill(skill)} className="hover:text-blue-800">×</button>
                            </span>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={addSkill}
                        placeholder="Add a skill (e.g. TypeScript) and press Enter"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Social Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SocialInput icon={Github} name="github" placeholder="GitHub Username" value={formData.socials.github} onChange={handleSocialChange} />
                        <SocialInput icon={Linkedin} name="linkedin" placeholder="LinkedIn URL" value={formData.socials.linkedin} onChange={handleSocialChange} />
                        <SocialInput icon={Twitter} name="twitter" placeholder="Twitter Handle" value={formData.socials.twitter} onChange={handleSocialChange} />
                        <SocialInput icon={Instagram} name="instagram" placeholder="Instagram Username" value={formData.socials.instagram} onChange={handleSocialChange} />
                        <SocialInput icon={Globe} name="website" placeholder="Portfolio Website" value={formData.socials.website} onChange={handleSocialChange} />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleUpdate}
                        disabled={isSaving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SocialInput = ({ icon: Icon, name, placeholder, value, onChange }) => (
    <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={18} />
        </div>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
        />
    </div>
);

const PrivacySettings = ({ user, setUser }) => {
    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: user.settings?.privacy?.profileVisibility || 'public',
        allowMessages: user.settings?.privacy?.allowMessages ?? true,
        allowTeamInvites: user.settings?.privacy?.allowTeamInvites ?? true,
        showOnlineStatus: user.settings?.privacy?.showOnlineStatus ?? true,
        showLastActive: user.settings?.privacy?.showLastActive ?? true
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleToggle = (key) => {
        setPrivacySettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleRadioChange = (e) => {
        setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data } = await api.put('/users/profile', {
                settings: { privacy: privacySettings }
            });
            setUser(data);
            alert("Privacy settings updated!");
        } catch (err) {
            console.error("Failed to update privacy settings", err);
            alert("Failed to update privacy settings.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 max-w-3xl">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Privacy Settings</h2>
                <p className="text-sm text-gray-500">Control who can see your profile and contact you.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900">Profile Visibility</h3>
                    <div className="space-y-3">
                        <RadioOption
                            name="visibility"
                            value="public"
                            label="Public"
                            description="Everyone can see your profile and posts."
                            checked={privacySettings.profileVisibility === 'public'}
                            onChange={handleRadioChange}
                        />
                        <RadioOption
                            name="visibility"
                            value="students"
                            label="Students Only"
                            description="Only verified students can see your profile."
                            checked={privacySettings.profileVisibility === 'students'}
                            onChange={handleRadioChange}
                        />
                        <RadioOption
                            name="visibility"
                            value="team"
                            label="Teammates Only"
                            description="Only people in your teams can see your profile."
                            checked={privacySettings.profileVisibility === 'team'}
                            onChange={handleRadioChange}
                        />
                    </div>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900">Interactions</h3>
                    <ToggleOption
                        label="Allow direct messages from everyone"
                        checked={privacySettings.allowMessages}
                        onChange={() => handleToggle('allowMessages')}
                    />
                    <ToggleOption
                        label="Allow team invitations"
                        checked={privacySettings.allowTeamInvites}
                        onChange={() => handleToggle('allowTeamInvites')}
                    />
                    <ToggleOption
                        label="Show my online status"
                        checked={privacySettings.showOnlineStatus}
                        onChange={() => handleToggle('showOnlineStatus')}
                    />
                    <ToggleOption
                        label="Show last active time"
                        checked={privacySettings.showLastActive}
                        onChange={() => handleToggle('showLastActive')}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const NotificationSettings = ({ user, setUser }) => {
    const [notifSettings, setNotifSettings] = useState({
        emailNotifications: user.settings?.notifications?.emailNotifications ?? true,
        teamInvites: user.settings?.notifications?.teamInvites ?? true,
        newMessages: user.settings?.notifications?.newMessages ?? true,
        eventReminders: user.settings?.notifications?.eventReminders ?? true,
        mentions: user.settings?.notifications?.mentions ?? true,
        pushNotifications: user.settings?.notifications?.pushNotifications ?? true
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleToggle = (key) => {
        setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data } = await api.put('/users/profile', {
                settings: { notifications: notifSettings }
            });
            setUser(data);
            alert("Notification settings updated!");
        } catch (err) {
            console.error("Failed to update notification settings", err);
            alert("Failed to update notification settings.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 max-w-3xl">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Notifications</h2>
                <p className="text-sm text-gray-500">Manage how you receive updates and alerts.</p>
            </div>

            <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
                    <Mail className="text-blue-600 mt-0.5" size={20} />
                    <div>
                        <h4 className="text-sm font-medium text-blue-900">Email Notifications</h4>
                        <p className="text-xs text-blue-700 mt-1">We'll send emails to {user.email}</p>
                    </div>
                    <div className="ml-auto">
                        <ToggleSwitch
                            checked={notifSettings.emailNotifications}
                            onChange={() => handleToggle('emailNotifications')}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900">Activity Alerts</h3>
                    <div className="space-y-4">
                        <NotificationRow
                            label="Team Invitations"
                            description="When someone invites you to join a team"
                            checked={notifSettings.teamInvites}
                            onChange={() => handleToggle('teamInvites')}
                        />
                        <NotificationRow
                            label="New Messages"
                            description="When you receive a direct message"
                            checked={notifSettings.newMessages}
                            onChange={() => handleToggle('newMessages')}
                        />
                        <NotificationRow
                            label="Event Reminders"
                            description="1 hour before an event starts"
                            checked={notifSettings.eventReminders}
                            onChange={() => handleToggle('eventReminders')}
                        />
                        <NotificationRow
                            label="Comments & Mentions"
                            description="When someone mentions you or comments on your post"
                            checked={notifSettings.mentions}
                            onChange={() => handleToggle('mentions')}
                        />
                    </div>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                    <ToggleOption
                        label="Enable push notifications on this device"
                        checked={notifSettings.pushNotifications}
                        onChange={() => handleToggle('pushNotifications')}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const NotificationRow = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-700">{label}</p>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
        <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
);

const SecuritySettings = () => (
    <div className="space-y-8 max-w-3xl">
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Security</h2>
            <p className="text-sm text-gray-500">Keep your account safe and secure.</p>
        </div>

        <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-900">Active Sessions</h3>
                    <button className="text-sm text-red-600 hover:text-red-700 font-medium">Log out all devices</button>
                </div>
                <div className="space-y-3">
                    <SessionRow
                        device="Current Session"
                        location="Unknown Location"
                        time="Active now"
                        isCurrent
                        icon={Smartphone}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Login History</h3>
                <div className="text-sm text-gray-600">
                    Last login: <span className="font-medium text-gray-900">Today</span>
                </div>
            </div>
        </div>
    </div>
);

const SessionRow = ({ device, location, time, isCurrent, icon: Icon }) => (
    <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                <Icon size={20} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    {device}
                    {isCurrent && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Current</span>}
                </p>
                <p className="text-xs text-gray-500">{location} • {time}</p>
            </div>
        </div>
    </div>
);

const DangerZone = () => {
    const navigate = useNavigate();

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            try {
                await api.delete('/users/profile');
                alert("Account deleted.");
                navigate('/signup');
            } catch (err) {
                console.error("Failed to delete account", err);
                alert("Failed to delete account.");
            }
        }
    };

    return (
        <div className="space-y-8 max-w-3xl">
            <div>
                <h2 className="text-xl font-semibold text-red-600 mb-1">Danger Zone</h2>
                <p className="text-sm text-gray-500">Irreversible and destructive actions.</p>
            </div>

            <div className="space-y-4">
                <div className="border border-red-100 bg-red-50 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-medium text-red-900">Reset Profile</h4>
                        <p className="text-xs text-red-700 mt-1">Clear all profile information and settings to default.</p>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                        Reset
                    </button>
                </div>

                <div className="border border-red-200 bg-white rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-medium text-gray-900">Delete Account</h4>
                        <p className="text-xs text-gray-500 mt-1">Permanently delete your account and all data.</p>
                    </div>
                    <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper Components

const ToggleOption = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">{label}</span>
        <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
);

const ToggleSwitch = ({ checked, onChange }) => {
    return (
        <button
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );
};

const RadioOption = ({ name, value, label, description, checked, onChange }) => (
    <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex items-center">
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-gray-300 checked:border-blue-600 checked:bg-blue-600 transition-all"
            />
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>
        </div>
        <div>
            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{label}</span>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
    </label>
);

export default Settings;
