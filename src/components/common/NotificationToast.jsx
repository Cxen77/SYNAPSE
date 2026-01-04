import React from 'react';
import toast from 'react-hot-toast';

const NotificationToast = ({ t, senderName, message, profilePic, chatId }) => {
    return (
        <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-[350px] w-full bg-white shadow-2xl rounded-full pointer-events-auto flex items-center p-2 ring-1 ring-black/5 cursor-pointer hover:bg-gray-50 transition-all duration-300 z-[99999]`}
            onClick={() => {
                toast.dismiss(t.id);
                window.location.href = `/chat/${chatId}`;
            }}
        >
            {/* Avatar */}
            <div className="flex-shrink-0">
                <img
                    className="h-10 w-10 rounded-full object-cover border border-gray-100 shadow-sm"
                    src={profilePic || "https://via.placeholder.com/40"}
                    alt={senderName}
                />
            </div>
            {/* Content */}
            <div className="ml-3 flex-1 min-w-0 pr-4">
                <p className="text-sm font-bold text-gray-900 leading-tight truncate">
                    {senderName}
                </p>
                <p className="text-sm text-gray-500 truncate leading-snug">
                    {message}
                </p>
            </div>
        </div>
    );
};


export default NotificationToast;
