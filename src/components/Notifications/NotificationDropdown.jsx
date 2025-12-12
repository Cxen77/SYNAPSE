import React, { useEffect, useState } from 'react';
import { HiBell, HiCheck, HiX } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.read) {
                await api.put(`/notifications/${notification._id}/read`);
                // Update local state to mark as read
                setNotifications(prev =>
                    prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
                );
            }

            // Navigate based on type
            if (notification.post) {
                navigate(`/post/${notification.post._id}`);
            } else if (notification.team) {
                navigate(`/teams/${notification.team._id}`);
            } else if (notification.event) {
                navigate(`/events/${notification.event._id}`);
            } else if (notification.sender) {
                navigate(`/users/${notification.sender.username}`);
            }

            onClose();
        } catch (error) {
            console.error("Failed to handle notification click", error);
        }
    };

    const markAllAsRead = async () => {
        // Implement if backend supports it, or loop through unread
        // For now, just a placeholder or individual click
    };

    if (!isOpen) return null;

    return (
        <div className="fixed top-[72px] left-4 right-4 md:absolute md:top-full md:right-0 md:left-auto md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 backdrop-blur-sm">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <HiBell className="text-blue-600" />
                    Notifications
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                >
                    <HiX className="w-5 h-5" />
                </button>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                        Loading...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                        <HiBell className="w-12 h-12 text-gray-200 mb-2" />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notification.read ? 'bg-blue-50/30' : ''
                                    }`}
                            >
                                {/* Avatar */}
                                <img
                                    src={notification.sender?.profilePic || `https://ui-avatars.com/api/?name=${notification.sender?.name}&background=random`}
                                    alt=""
                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-200"
                                />

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 leading-snug">
                                        <span className="font-semibold">{notification.sender?.name}</span>
                                        {' '}
                                        {notification.type === 'like' && 'liked your post'}
                                        {notification.type === 'comment' && 'commented on your post'}
                                        {notification.type === 'follow' && 'started following you'}
                                        {notification.type === 'invite' && 'invited you to a team'}
                                        {notification.type === 'join' && 'joined your team'}
                                        {notification.type === 'reply' && 'replied to your comment'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>

                                {/* Unread Indicator */}
                                {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;
