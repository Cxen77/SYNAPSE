import React from 'react';
import toast from 'react-hot-toast';

const NotificationToast = ({ t, senderName, message, profilePic, chatId }) => {
    return (
        <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/10 cursor-pointer hover:bg-gray-50 transition-all duration-300 z-[99999]`}
            onClick={() => {
                toast.dismiss(t.id);
                window.location.href = `/chat/${chatId}`;
            }}
        >
            <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                        <img
                            className="h-10 w-10 rounded-full object-cover border border-gray-100 shadow-sm"
                            src={profilePic || "https://via.placeholder.com/40"}
                            alt={senderName}
                        />
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                            {senderName}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2 leading-snug">
                            {message}
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex border-l border-black/5">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toast.dismiss(t.id);
                    }}
                    className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default NotificationToast;
