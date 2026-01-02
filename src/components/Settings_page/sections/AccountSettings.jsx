import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Key, LogOut } from 'lucide-react';
import useSettings from '../../../hooks/useSettings';
import api from '../../../api/axios';
import { useNavigate } from 'react-router-dom';

const AccountSettings = ({ user, setUser }) => {
    const { updateSettings, loading } = useSettings(user, setUser);
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
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <h4 className="text-sm font-bold text-blue-900 mb-1">Connected Accounts</h4>
                        <p className="text-xs text-blue-700 mb-3">Login easier by connecting your other accounts.</p>
                        <button className="text-sm text-blue-600 font-medium hover:underline">Connect Google Account</button>
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
