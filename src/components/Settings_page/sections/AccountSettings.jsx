import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Key, LogOut } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import useSettings from '../../../hooks/useSettings';
import api, { getAccessToken } from '../../../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const AccountSettings = ({ user, setUser }) => {
    const { updateSettings, loading } = useSettings(user, setUser);
    const { currentUser } = useAuth();
    const [githubConnected, setGithubConnected] = useState(!!user.githubId);
    const [connectLoading, setConnectLoading] = useState(false);

    useEffect(() => {
        setGithubConnected(!!user.githubId);
    }, [user]);

    const handleGithubConnect = async () => {
        if (githubConnected) {
            // Disconnect
            try {
                setConnectLoading(true);
                await api.delete('/users/github');
                setGithubConnected(false);
                // Ideally update 'user' prop too to reflect change
                setUser(prev => ({ ...prev, githubId: undefined }));
            } catch (err) {
                console.error("Failed to disconnect GitHub", err);
            } finally {
                setConnectLoading(false);
            }
        } else {
            // Connect
            const token = getAccessToken();
            window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/github?token=${token}`;
        }
    };

    const [formData, setFormData] = useState({
        name: user.name || '',
        username: user.username || '',
        email: user.email || ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = () => {
        updateSettings('/users/profile', formData, "Account updated successfully!");
    };

    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            navigate('/login');
        } catch (err) {
            console.error("Logout failed", err);
            navigate('/login');
        }
    };

    return (
        <div className="space-y-8 max-w-3xl pb-24 md:pb-0">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
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
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                        />
                        <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                            Verify
                        </button>
                    </div>
                </div>

                {/* Sticky Save Button for Mobile */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:static md:bg-transparent md:border-0 md:p-0 md:flex md:justify-end md:pt-4 z-50">
                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:scale-100 relative overflow-hidden"
                    >
                        <span className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                            Save Changes
                        </span>
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                        )}
                    </button>
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Password & Authentication</h3>
                    <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm">
                        <Key size={16} />
                        Change Password
                    </button>
                    <div className="mt-8">
                        <h4 className="text-sm font-bold text-gray-900 mb-4">Connected Accounts</h4>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                                    <FaGithub className="text-2xl text-gray-900" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">GitHub</h4>
                                    <p className="text-xs text-gray-500">
                                        {githubConnected ? 'Account connected' : 'Link your GitHub account'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleGithubConnect}
                                disabled={connectLoading}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition ${githubConnected
                                    ? 'bg-white border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200'
                                    : 'bg-gray-900 text-white hover:bg-black'
                                    }`}
                            >
                                {connectLoading ? 'Processing...' : (githubConnected ? 'Disconnect' : 'Connect')}
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 md:hidden">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 font-bold bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                        >
                            <LogOut size={20} />
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

AccountSettings.propTypes = {
    user: PropTypes.shape({
        name: PropTypes.string,
        username: PropTypes.string,
        email: PropTypes.string
    }).isRequired,
    setUser: PropTypes.func.isRequired
};

export default AccountSettings;
