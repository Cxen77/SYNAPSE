import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Avatar from '../common/Avatar';
import {
    Edit3,
    Share2,
    MapPin,
    Briefcase,
    Mail,
    UserPlus,
    Eye,
    Users,
    FolderGit,
    FileText,
    Check
} from 'lucide-react';
import ImageUpload from './ImageUpload';
import ProfileEditModal from './ProfileEditModal';

const ProfileHero = ({ user, isOwner, isOwnProfile, isFollowing, onFollow, onInvite, onToggleView, onProfileUpdate }) => {
    const navigate = useNavigate();
    const [showEditModal, setShowEditModal] = useState(false);

    const handleMessage = async () => {
        try {
            const { data } = await axios.post('/chat', { userId: user._id }); // ensure using _id
            navigate(`/chat/${data._id}`);
        } catch (error) {
            console.error("Error accessing chat", error);
            navigate('/chat');
        }
    };

    const handleProfileUpdate = (updatedData) => {
        console.log('ProfileHero received update:', updatedData);
        onProfileUpdate(updatedData);
        setShowEditModal(false);
    };

    const handleImageUpload = (data) => {
        console.log('ProfileHero received image upload:', data);
        onProfileUpdate(data);
    };

    const handleShare = async () => {
        const shareData = {
            title: `${user.name}'s Profile`,
            text: `Check out ${user.name}'s profile on Synapse!`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                // toast.success('Profile link copied!'); 
                alert('Profile link copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (!user) return null;

    return (
        <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
            {/* Cover Banner */}
            <div className="h-64 relative bg-gradient-to-r from-blue-50 to-purple-50">
                {user.bannerPic ? (
                    <img
                        src={user.bannerPic}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-100 to-purple-100"></div>
                )}
                {/* Edit Banner Button - Only visible to owner in edit mode */}
                {isOwner && (
                    <ImageUpload
                        type="banner"
                        currentImage={user.bannerPic}
                        onUploadSuccess={handleImageUpload}
                    />
                )}
            </div>

            {/* Profile Info Section */}
            <div className="px-8 pb-8">
                {/* Profile Picture & Basic Info */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6 gap-4">
                    <div className="flex flex-col md:flex-row md:items-end gap-6 flex-1 min-w-0">
                        {/* Profile Picture */}
                        <div className="relative -mt-20 flex-shrink-0">
                            <Avatar
                                src={user.profilePic}
                                alt={user.name}
                                size="xl"
                                className="border-4 border-white shadow-xl bg-white"
                            />
                            {/* Edit Profile Picture Button - Only visible to owner in edit mode */}
                            {isOwner && (
                                <ImageUpload
                                    type="profile"
                                    currentImage={user.profilePic}
                                    onUploadSuccess={handleImageUpload}
                                />
                            )}
                        </div>

                        {/* Name & Basic Info */}
                        <div className="mb-2 min-w-0 w-full">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                                <h1 className="text-3xl font-bold text-gray-900 break-words leading-tight">{user.name}</h1>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex-shrink-0 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    Available
                                </span>
                            </div>
                            <p className="text-lg text-gray-600 mb-1 truncate">@{user.username}</p>
                            <p className="text-gray-700 font-medium truncate">{user.course} Student</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap md:flex-nowrap gap-3 mt-4 md:mt-0 mb-2 flex-shrink-0 w-full md:w-auto">
                        {isOwnProfile ? (
                            // Owner Controls
                            isOwner ? (
                                <>
                                    <button
                                        onClick={onToggleView}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold border border-blue-200 shadow-sm whitespace-nowrap"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View as Public
                                    </button>
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-sm whitespace-nowrap"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={onToggleView}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold shadow-sm whitespace-nowrap"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    View as Owner
                                </button>
                            )
                        ) : (
                            // Visitor Controls
                            <div className="grid grid-cols-2 md:flex gap-3 w-full md:w-auto">
                                <button
                                    onClick={onFollow}
                                    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg transition font-semibold shadow-sm whitespace-nowrap ${isFollowing
                                        ? "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                >
                                    {isFollowing ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                                    {isFollowing ? "Following" : "Follow"}
                                </button>
                                <button
                                    onClick={onInvite}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold border border-gray-300 shadow-sm whitespace-nowrap"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Invite
                                </button>
                                <button
                                    onClick={handleMessage}
                                    className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold border border-gray-300 shadow-sm whitespace-nowrap"
                                >
                                    <Mail className="w-4 h-4" />
                                    Message
                                </button>
                            </div>
                        )}
                        <button
                            onClick={handleShare}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold border border-gray-300 shadow-sm whitespace-nowrap"
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                    </div>
                </div>

                {/* Bio & Details */}
                <div className="mb-8">
                    <p className="text-gray-700 mb-4 max-w-3xl text-lg leading-relaxed">{user.bio}</p>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                            <Briefcase className="w-4 h-4 text-gray-500" />
                            {user.course} • {user.year}
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            University Campus
                        </span>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="flex justify-around md:justify-start md:gap-4 py-4 md:py-6 border-t border-gray-100">
                    {/* Followers */}
                    <div className="flex flex-col md:flex-row items-center md:gap-3 md:px-4 md:py-3 md:bg-gray-50 md:rounded-xl md:hover:bg-blue-50 transition-colors group cursor-pointer md:border md:border-transparent md:hover:border-blue-100">
                        <div className="hidden md:block p-2 bg-white rounded-lg text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-lg md:text-2xl font-bold text-gray-900 leading-none">{user.followers?.length || 0}</p>
                            <p className="text-xs text-gray-500 md:font-medium md:uppercase md:tracking-wide mt-0.5 md:mt-1">Followers</p>
                        </div>
                    </div>

                    {/* Following */}
                    <div className="flex flex-col md:flex-row items-center md:gap-3 md:px-4 md:py-3 md:bg-gray-50 md:rounded-xl md:hover:bg-blue-50 transition-colors group cursor-pointer md:border md:border-transparent md:hover:border-blue-100">
                        <div className="hidden md:block p-2 bg-white rounded-lg text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-lg md:text-2xl font-bold text-gray-900 leading-none">{user.following?.length || 0}</p>
                            <p className="text-xs text-gray-500 md:font-medium md:uppercase md:tracking-wide mt-0.5 md:mt-1">Following</p>
                        </div>
                    </div>

                    {/* Teams */}
                    <div
                        onClick={() => scrollToSection('teams-section')}
                        className="flex flex-col md:flex-row items-center md:gap-3 md:px-4 md:py-3 md:bg-gray-50 md:rounded-xl md:hover:bg-purple-50 transition-colors group cursor-pointer md:border md:border-transparent md:hover:border-purple-100"
                    >
                        <div className="hidden md:block p-2 bg-white rounded-lg text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-lg md:text-2xl font-bold text-gray-900 leading-none">{user.teams?.length || 0}</p>
                            <p className="text-xs text-gray-500 md:font-medium md:uppercase md:tracking-wide mt-0.5 md:mt-1">Teams</p>
                        </div>
                    </div>

                    {/* Projects */}
                    <div
                        onClick={() => scrollToSection('projects-section')}
                        className="flex flex-col md:flex-row items-center md:gap-3 md:px-4 md:py-3 md:bg-gray-50 md:rounded-xl md:hover:bg-orange-50 transition-colors group cursor-pointer md:border md:border-transparent md:hover:border-orange-100"
                    >
                        <div className="hidden md:block p-2 bg-white rounded-lg text-orange-600 shadow-sm group-hover:scale-110 transition-transform">
                            <FolderGit className="w-5 h-5" />
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-lg md:text-2xl font-bold text-gray-900 leading-none">{user.projects?.length || 0}</p>
                            <p className="text-xs text-gray-500 md:font-medium md:uppercase md:tracking-wide mt-0.5 md:mt-1">Projects</p>
                        </div>
                    </div>

                    {/* Posts */}
                    <div
                        onClick={() => scrollToSection('posts-section')}
                        className="flex flex-col md:flex-row items-center md:gap-3 md:px-4 md:py-3 md:bg-gray-50 md:rounded-xl md:hover:bg-green-50 transition-colors group cursor-pointer md:border md:border-transparent md:hover:border-green-100"
                    >
                        <div className="hidden md:block p-2 bg-white rounded-lg text-green-600 shadow-sm group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-lg md:text-2xl font-bold text-gray-900 leading-none">{user.postsCount || 0}</p>
                            <p className="text-xs text-gray-500 md:font-medium md:uppercase md:tracking-wide mt-0.5 md:mt-1">Posts</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <ProfileEditModal
                    user={user}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handleProfileUpdate}
                />
            )}
        </div>
    );
};

export default ProfileHero;
