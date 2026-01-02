import React from 'react';
import PropTypes from 'prop-types';
import { Smartphone, LogOut, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';

const SessionRow = ({ device, location, time, isCurrent, icon: Icon }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
        <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-100 rounded-xl text-gray-600">
                <Icon size={20} />
            </div>
            <div>
                <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    {device}
                    {isCurrent && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase font-bold rounded-full tracking-wide">Current</span>}
                </p>
                <p className="text-xs text-gray-500 font-medium">{location} • {time}</p>
            </div>
        </div>
    </div>
);

SessionRow.propTypes = {
    device: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    isCurrent: PropTypes.bool,
    icon: PropTypes.elementType.isRequired
};

export const SecuritySettings = () => (
    <div className="space-y-8 max-w-3xl pb-24 md:pb-0">
        <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Active Sessions</h3>
                        <p className="text-sm text-gray-500">Manage devices logged into your account</p>
                    </div>
                    <button className="text-sm text-red-600 hover:text-red-700 font-medium bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                        Log out all
                    </button>
                </div>
                <div className="space-y-1">
                    <SessionRow
                        device="Chrome on Windows"
                        location="New York, USA"
                        time="Active now"
                        isCurrent
                        icon={Smartphone}
                    />
                    <SessionRow
                        device="iPhone 13 App"
                        location="New York, USA"
                        time="2 days ago"
                        icon={Smartphone}
                    />
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-2">Login History</h3>
                <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    Last login was <span className="font-bold text-gray-900">Today, 10:23 AM</span> from <span className="font-medium text-gray-800">192.168.1.1</span>
                </div>
            </div>
        </div>
    </div>
);

export const DangerZone = () => {
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
        <div className="space-y-8 max-w-3xl pb-24 md:pb-0">
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-800">
                <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm">Proceed with caution. These actions are irreversible.</p>
            </div>

            <div className="space-y-4">
                <div className="border border-gray-200 bg-white rounded-2xl p-6 flex items-center justify-between shadow-sm">
                    <div>
                        <h4 className="text-base font-bold text-gray-900">Reset Profile</h4>
                        <p className="text-sm text-gray-500 mt-1">Clear all profile information and settings to default.</p>
                    </div>
                    <button className="px-4 py-2 text-sm font-bold text-gray-700 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors">
                        Reset Data
                    </button>
                </div>

                <div className="border border-red-200 bg-red-50/30 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                    <div>
                        <h4 className="text-base font-bold text-red-900">Delete Account</h4>
                        <p className="text-sm text-red-700/80 mt-1">Permanently delete your account and all data.</p>
                    </div>
                    <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <LogOut size={16} />
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};
