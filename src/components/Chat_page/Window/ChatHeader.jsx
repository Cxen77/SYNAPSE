import { FaPhone, FaVideo, FaEllipsisV, FaArrowLeft } from "react-icons/fa";

function ChatHeader({ chat, onBack }) {
    if (!chat) return null;

    return (
        <div className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
                >
                    <FaArrowLeft />
                </button>

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

            <div className="flex items-center gap-2 md:gap-4 text-gray-400">
                <button className="p-2 hover:bg-gray-100 rounded-full hover:text-gray-600 transition-colors">
                    <FaPhone size={16} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full hover:text-gray-600 transition-colors">
                    <FaVideo size={16} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full hover:text-gray-600 transition-colors">
                    <FaEllipsisV size={16} />
                </button>
            </div>
        </div>
    );
}

export default ChatHeader;
