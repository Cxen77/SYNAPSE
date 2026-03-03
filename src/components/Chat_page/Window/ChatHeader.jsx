import { useState, useRef, useEffect } from "react";
import { FaEllipsisV, FaArrowLeft, FaTrash, FaSignOutAlt, FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import toast from "react-hot-toast";

function ChatHeader({ chat, onBack }) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // Close menu on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!chat) return null;

    const handleLeaveGroup = async () => {
        if (!window.confirm("Are you sure you want to leave this group?")) return;
        try {
            await api.put('/chat/leave', { chatId: chat._id });
            toast.success("You left the group");
            navigate('/chat');
            window.location.reload(); // Hard refresh to update list
        } catch (error) {
            toast.error("Failed to leave group");
            console.error(error);
        }
    };

    const handleDeleteChat = async () => {
        if (!window.confirm("Are you sure you want to delete this chat?")) return;
        try {
            await api.put('/chat/delete', { chatId: chat._id });
            toast.success("Chat deleted");
            navigate('/chat');
            window.location.reload(); // Hard refresh to update list
        } catch (error) {
            toast.error("Failed to delete chat");
            console.error(error);
        }
    };

    return (
        <div className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white relative">
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
                    {/* Status Dot */}
                    {!chat.isGroupChat && (
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${chat.status === 'Online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">{chat.name}</h3>
                    <p className="text-sm text-gray-500">{chat.status}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 text-gray-400 relative">


                <div ref={menuRef} className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className={`p-2 rounded-full transition-colors ${showMenu ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 hover:text-gray-600'}`}
                    >
                        <FaEllipsisV size={16} />
                    </button>

                    {/* DROPDOWN MENU */}
                    {showMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeInScale origin-top-right">
                            {chat.isGroupChat ? (
                                <>
                                    <button
                                        onClick={handleLeaveGroup}
                                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors text-sm font-medium"
                                    >
                                        <FaSignOutAlt /> Leave Group
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleDeleteChat}
                                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors text-sm font-medium"
                                >
                                    <FaTrash /> Delete Chat
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChatHeader;
