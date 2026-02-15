import React, { useState, useEffect, useCallback } from 'react';
import { Smartphone, Monitor, Globe, LogOut, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

// Parse user-agent string to friendly device name
const parseDevice = (ua) => {
    if (!ua || ua === 'unknown') return { name: 'Unknown Device', icon: Globe };

    let browser = 'Browser';
    let os = 'Device';

    // Browser detection
    if (ua.includes('Edg/') || ua.includes('Edge')) browser = 'Edge';
    else if (ua.includes('OPR') || ua.includes('Opera')) browser = 'Opera';
    else if (ua.includes('Brave')) browser = 'Brave';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';

    // OS detection
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    // Icon
    const isMobile = ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone');
    const icon = isMobile ? Smartphone : Monitor;

    return { name: `${browser} on ${os}`, icon };
};

// Format relative time
const formatTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const formatExpiry = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
};

const SessionRow = ({ session, isCurrent }) => {
    const { name, icon: Icon } = parseDevice(session.userAgent);

    return (
        <div className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isCurrent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        {name}
                        {isCurrent && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase font-bold rounded-full tracking-wide">
                                This device
                            </span>
                        )}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                        {session.ipAddress !== 'unknown' ? session.ipAddress : 'IP hidden'} • Created {formatTime(session.createdAt)} • Expires {formatExpiry(session.expiresAt)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export const SecuritySettings = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loggingOutAll, setLoggingOutAll] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const { logoutAll } = useAuth();

    const fetchSessions = useCallback(async () => {
        try {
            setLoading(true);
            const [sessionsRes, currentRes] = await Promise.all([
                api.get('/auth/sessions'),
                api.get('/auth/session')
            ]);
            setSessions(sessionsRes.data.sessions || []);
            if (currentRes.data.session) {
                setCurrentSessionId(currentRes.data.session._id);
            }
        } catch (err) {
            // Session fetch failed — might not be logged in
            setSessions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const handleLogoutAll = async () => {
        if (!window.confirm('This will sign you out of all devices, including this one. Continue?')) return;
        try {
            setLoggingOutAll(true);
            await logoutAll();
            toast.success('All sessions logged out');
        } catch (err) {
            toast.error('Failed to logout all sessions');
        } finally {
            setLoggingOutAll(false);
        }
    };

    return (
        <div className="space-y-8 max-w-3xl pb-24 md:pb-0">
            <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-bold text-gray-900">Active Sessions</h3>
                            <p className="text-sm text-gray-500">
                                {sessions.length > 0 ? `${sessions.length} active session${sessions.length > 1 ? 's' : ''}` : 'No active sessions'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchSessions}
                                disabled={loading}
                                className="text-sm text-gray-600 hover:text-gray-800 font-medium bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            </button>
                            {sessions.length > 0 && (
                                <button
                                    onClick={handleLogoutAll}
                                    disabled={loggingOutAll}
                                    className="text-sm text-red-600 hover:text-red-700 font-medium bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    {loggingOutAll ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                                    Log out all
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 size={24} className="animate-spin text-gray-400" />
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-8 text-sm text-gray-400">
                                No active sessions found
                            </div>
                        ) : (
                            sessions.map((session) => (
                                <SessionRow
                                    key={session._id}
                                    session={session}
                                    isCurrent={session._id === currentSessionId}
                                />
                            ))
                        )}
                    </div>
                </div>

                {sessions.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-base font-bold text-gray-900 mb-2">Session Info</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Total Active</p>
                                <p className="text-lg font-bold text-gray-900">{sessions.length} / 5</p>
                            </div>
                            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Latest Login</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {sessions.length > 0 ? formatTime(sessions[0].createdAt) : '—'}
                                </p>
                            </div>
                            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Nearest Expiry</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {sessions.length > 0 ? formatExpiry(sessions[sessions.length - 1].expiresAt) : '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

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
