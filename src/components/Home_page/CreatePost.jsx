import React, { useState, useRef, useEffect } from "react";
import { HiPhotograph, HiX } from "react-icons/hi";
import { Users, ChevronDown, X as LucideX } from "lucide-react";
import api from "../../api/axios";
import Avatar from "../common/Avatar";

export default function CreatePost({ user, onPostCreated }) {
    const [text, setText] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openTeams, setOpenTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [showTeamDropdown, setShowTeamDropdown] = useState(false);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const dropdownRef = useRef(null);

    const displayUser = user || {};

    // Fetch the user's own open public active teams once on mount
    useEffect(() => {
        const fetchOpenTeams = async () => {
            try {
                const { data } = await api.get('/teams');
                const eligible = (data || []).filter(
                    t =>
                        t.isLookingForMembers &&
                        t.visibility === 'public' &&
                        t.teamStatus === 'active'
                );
                setOpenTeams(eligible);
            } catch (err) {
                // Silently fail — attaching a team is optional
                console.error("Could not load open teams", err);
            }
        };
        fetchOpenTeams();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowTeamDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleTextChange = (e) => {
        setText(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    async function submitPost() {
        if (!text.trim() && !imageFile) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('content', text);
            if (imageFile) {
                formData.append('image', imageFile);
            }
            if (selectedTeam) {
                formData.append('attachedTeamId', selectedTeam._id);
            }

            const { data } = await api.post('/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const newPost = {
                ...data,
                user: user || { name: displayUser.name, profilePic: displayUser.profilePic, course: displayUser.course },
                attachedTeam: selectedTeam ? {
                    _id: selectedTeam._id,
                    name: selectedTeam.name,
                    category: selectedTeam.category,
                    isLookingForMembers: selectedTeam.isLookingForMembers,
                    openRoles: (selectedTeam.openRoles || []).filter(r => r.isOpen).slice(0, 5).map(r => ({ _id: r._id, title: r.title })),
                    membersCount: selectedTeam.members?.length || 0,
                } : null,
                hasAttachedTeam: !!selectedTeam,
            };

            if (onPostCreated) {
                onPostCreated(newPost);
            }

            setText("");
            removeImage();
            setSelectedTeam(null);
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        } catch (err) {
            console.error("Failed to create post", err);
            alert("Failed to create post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const openRoles = selectedTeam?.openRoles?.filter(r => r.isOpen) || [];

    return (
        <div className="p-4 md:p-5">
            <div className="flex gap-3 md:gap-4">
                <div className="hidden sm:block pt-1">
                    <Avatar
                        src={displayUser.profilePic}
                        alt="me"
                        size="md"
                        className="ring-2 ring-white shadow-sm object-cover"
                    />
                </div>
                <div className="block sm:hidden pt-1">
                    <Avatar
                        src={displayUser.profilePic}
                        alt="me"
                        size="sm"
                        className="ring-2 ring-white shadow-sm object-cover"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            placeholder={`What's happening?`}
                            value={text}
                            onChange={handleTextChange}
                            className="w-full resize-none bg-transparent border-none p-0 py-2 text-base md:text-lg placeholder-gray-400 focus:ring-0 outline-none text-gray-900 min-h-[50px] md:min-h-[60px]"
                        />
                    </div>

                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="mt-3 relative inline-block group">
                            <div className="relative rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="max-h-64 w-auto object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                            </div>
                            <button
                                onClick={removeImage}
                                className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-full backdrop-blur-sm transition-all shadow-sm"
                            >
                                <HiX size={14} className="stroke-2" />
                            </button>
                        </div>
                    )}

                    {/* Selected Team Preview Badge */}
                    {selectedTeam && (
                        <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-blue-700 truncate">{selectedTeam.name}</p>
                                {openRoles.length > 0 && (
                                    <p className="text-[10px] text-blue-500 truncate">
                                        {openRoles.slice(0, 2).map(r => r.title).join(', ')}
                                        {openRoles.length > 2 ? ` +${openRoles.length - 2} more` : ''}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedTeam(null)}
                                className="p-1 text-blue-400 hover:text-blue-600 rounded-full hover:bg-blue-100 transition"
                                title="Remove team"
                            >
                                <LucideX size={14} />
                            </button>
                        </div>
                    )}

                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                    />

                    <div className="mt-3 pt-3 flex items-center justify-between border-t border-gray-50">
                        {/* Media Actions */}
                        <div className="flex items-center gap-0.5 md:gap-2 -ml-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors relative group"
                                title="Add Photo"
                            >
                                <HiPhotograph size={20} className="md:w-6 md:h-6" />
                            </button>

                            {/* Attach Team Button — only shown if eligible teams exist */}
                            {openTeams.length > 0 && (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setShowTeamDropdown(prev => !prev)}
                                        title="Attach Open Team"
                                        className={`p-2 rounded-full transition-colors flex items-center gap-1 text-sm font-medium ${selectedTeam
                                            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                            }`}
                                    >
                                        <Users size={18} className="md:w-5 md:h-5" />
                                        <ChevronDown size={12} className={`hidden sm:block transition-transform ${showTeamDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showTeamDropdown && (
                                        <div className="absolute left-0 bottom-full mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                            <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Your Open Teams</p>
                                            {openTeams.map(team => {
                                                const roles = team.openRoles?.filter(r => r.isOpen) || [];
                                                return (
                                                    <button
                                                        key={team._id}
                                                        onClick={() => {
                                                            setSelectedTeam(team);
                                                            setShowTeamDropdown(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors ${selectedTeam?._id === team._id ? 'bg-blue-50' : ''}`}
                                                    >
                                                        <p className="text-sm font-semibold text-gray-800 truncate">{team.name}</p>
                                                        <p className="text-[11px] text-gray-400 truncate">
                                                            {team.category}
                                                            {roles.length > 0 && ` · ${roles.length} open role${roles.length > 1 ? 's' : ''}`}
                                                        </p>
                                                    </button>
                                                );
                                            })}
                                            {selectedTeam && (
                                                <button
                                                    onClick={() => { setSelectedTeam(null); setShowTeamDropdown(false); }}
                                                    className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors border-t border-gray-50 mt-1"
                                                >
                                                    Remove attachment
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={submitPost}
                            disabled={(!text.trim() && !imageFile) || isSubmitting}
                            className="bg-[#3B82F6] text-white px-5 py-1.5 md:px-6 md:py-2 rounded-full text-sm font-bold hover:opacity-90 transition-all disabled:cursor-not-allowed shadow-sm hover:shadow-md transform active:scale-95"
                        >
                            {isSubmitting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
