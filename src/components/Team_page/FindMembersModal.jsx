import React, { useState, useEffect } from "react";
import { FaTimes, FaSearch, FaUserPlus, FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Avatar from "../common/Avatar";
import toast from "react-hot-toast";

export default function FindMembersModal({ isOpen, onClose, teamId }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const [invitedUsers, setInvitedUsers] = useState(new Set());

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (debouncedQuery.trim()) {
            searchUsers(debouncedQuery);
        } else {
            setResults([]);
        }
    }, [debouncedQuery]);

    // Reset invited users when modal opens/closes or team changes
    useEffect(() => {
        if (isOpen) {
            setInvitedUsers(new Set());
            setQuery("");
            setResults([]);
        }
    }, [isOpen, teamId]);

    const searchUsers = async (searchTerm) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/users/search?q=${searchTerm}`);
            setResults(data);
        } catch (err) {
            console.error("Failed to search users", err);
            toast.error("Failed to search users");
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (username) => {
        if (!teamId) {
            onClose();
            navigate(`/profile/${username}`);
        }
    };

    const handleInvite = async (e, userId) => {
        e.stopPropagation();
        if (!teamId) return;

        try {
            await api.put(`/teams/${teamId}/invite`, { userId });
            setInvitedUsers(prev => new Set(prev).add(userId));
            toast.success("Invitation sent!");
        } catch (err) {
            console.error("Failed to invite user", err);
            toast.error(err.response?.data?.message || "Failed to invite user");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">
                        {teamId ? "Invite Members" : "Find Members"}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-5 border-b border-gray-100">
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name or username..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition bg-gray-50 focus:bg-white"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Searching...</div>
                    ) : results.length > 0 ? (
                        <div className="space-y-2">
                            {results.map((user) => {
                                const isInvited = invitedUsers.has(user._id);
                                return (
                                    <div
                                        key={user._id}
                                        className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition group cursor-pointer"
                                        onClick={() => handleUserClick(user.username)}
                                    >
                                        <Avatar
                                            src={user.profilePic}
                                            alt={user.name}
                                            size="md"
                                            className="border border-gray-200"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900">{user.name}</h4>
                                            <p className="text-sm text-gray-500">@{user.username}</p>
                                            {user.skills && user.skills.length > 0 && (
                                                <p className="text-xs text-gray-400 mt-1 truncate">{user.skills.join(", ")}</p>
                                            )}
                                        </div>
                                        {teamId ? (
                                            <button
                                                className={`p-2 rounded-full transition ${isInvited
                                                    ? "bg-green-100 text-green-600 cursor-default"
                                                    : "text-blue-600 hover:bg-blue-50"}`}
                                                onClick={(e) => !isInvited && handleInvite(e, user._id)}
                                                disabled={isInvited}
                                            >
                                                {isInvited ? <FaCheck /> : <FaUserPlus />}
                                            </button>
                                        ) : (
                                            <button
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition opacity-0 group-hover:opacity-100"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleUserClick(user.username);
                                                }}
                                            >
                                                <FaUserPlus />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : query.trim() ? (
                        <div className="text-center py-10 text-gray-500">No users found</div>
                    ) : (
                        <div className="text-center py-10 text-gray-400">
                            Type to search for amazing talent
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
