import { FaPhone, FaVideo, FaEllipsisV } from "react-icons/fa";

function ChatHeader({ chat }) {
    if (!chat) return null;

    return (
        <div className="h-16 px-6 flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">{chat.name}</h3>
                    <p className="text-sm text-gray-500">{chat.status}</p>
                </div>
            </div>

            <div className="flex items-center gap-4 text-gray-400">
                <button className="hover:text-gray-600 transition-colors">
                    <FaPhone size={18} />
                </button>
                <button className="hover:text-gray-600 transition-colors">
                    <FaVideo size={18} />
                </button>
                <button className="hover:text-gray-600 transition-colors">
                    <FaEllipsisV size={18} />
                </button>
            </div>
        </div>
    );
}

export default ChatHeader;
