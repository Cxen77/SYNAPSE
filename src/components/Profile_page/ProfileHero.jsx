import React, { useState } from 'react';
import { FaEdit, FaShare, FaMapMarkerAlt, FaBriefcase, FaEnvelope, FaUserPlus, FaEye, FaUsers, FaProjectDiagram, FaLayerGroup, FaList } from 'react-icons/fa';
import ImageUpload from './ImageUpload';
import ProfileEditModal from './ProfileEditModal';

const ProfileHero = ({ user, isOwner, isOwnProfile, isFollowing, onFollow, onInvite, onToggleView, onProfileUpdate }) => {
    const [showEditModal, setShowEditModal] = useState(false);

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
                alert('Profile link copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
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
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6">
                    <div className="flex flex-col md:flex-row md:items-end gap-6">
                        {/* Profile Picture */}
                        <div className="relative -mt-20">
                            <img
                                src={user.profilePic || "https://via.placeholder.com/150"}
                                alt="Profile"
                                className="w-40 h-40 rounded-full border-4 border-white shadow-xl object-cover bg-white"
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
                        <div className="mb-2">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                    Available
                                </span>
                            </div>
                            <p className="text-lg text-gray-600 mb-1">@{user.username}</p>
                            <p className="text-gray-700 font-medium">{user.course} Student</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mt-4 md:mt-0 mb-2">
                        {isOwnProfile ? (
                            // Owner Controls
                            isOwner ? (
                                <>
                                    <button
                                        onClick={onToggleView}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold border border-blue-200 shadow-sm"
                                    >
                                        <FaEye className="w-4 h-4" />
                                        View as Public
                                    </button>
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-sm"
                                    >
                                        <FaEdit className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={onToggleView}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold shadow-sm"
                                >
                                    <FaEdit className="w-4 h-4" />
                                    View as Owner
                                </button>
                            )
                        ) : (
                            // Visitor Controls
                            <>
                                <button
                                    onClick={onFollow}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition font-semibold shadow-sm ${isFollowing
                                            ? "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                >
                                    <FaUserPlus className="w-4 h-4" />
                                    {isFollowing ? "Following" : "Follow"}
                                </button>
                                <button
                                    onClick={onInvite}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold border border-gray-300 shadow-sm"
                                >
                                    <FaUsers className="w-4 h-4" />
                                    Invite
                                </button>
                                <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold border border-gray-300 shadow-sm">
                                    <FaEnvelope className="w-4 h-4" />
                                    Message
                                </button>
                            </>
                        )}
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold border border-gray-300 shadow-sm"
                        >
                            <FaShare className="w-4 h-4" />
                            Share
                        </button>
                    </div>
                </div>

                {/* Bio & Details */}
                <div className="mb-8">
                    <p className="text-gray-700 mb-4 max-w-3xl text-lg leading-relaxed">{user.bio}</p>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                            <FaBriefcase className="w-4 h-4 text-gray-500" />
                            {user.course} • {user.year}
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                            <FaMapMarkerAlt className="w-4 h-4 text-gray-500" />
                            University Campus
                        </span>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="flex flex-wrap gap-4 py-6 border-t border-gray-100">
                    {/* Followers */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group cursor-pointer border border-transparent hover:border-blue-100">
                        <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                            <FaUsers className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 leading-none">{user.followers?.length || 0}</p>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Followers</p>
                        </div>
                    </div>

                    {/* Following */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group cursor-pointer border border-transparent hover:border-blue-100">
                        <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                            <FaUserPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 leading-none">{user.following?.length || 0}</p>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Following</p>
                        </div>
                    </div>

                    {/* Teams */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors group cursor-pointer border border-transparent hover:border-purple-100">
                        <div className="p-2 bg-white rounded-lg text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                            <FaLayerGroup className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 leading-none">0</p>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Teams</p>
                        </div>
                    </div>

                    {/* Projects */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors group cursor-pointer border border-transparent hover:border-orange-100">
                        <div className="p-2 bg-white rounded-lg text-orange-600 shadow-sm group-hover:scale-110 transition-transform">
                            <FaProjectDiagram className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 leading-none">0</p>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Projects</p>
                        </div>
                    </div>

                    {/* Posts */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors group cursor-pointer border border-transparent hover:border-green-100">
                        <div className="p-2 bg-white rounded-lg text-green-600 shadow-sm group-hover:scale-110 transition-transform">
                            <FaList className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 leading-none">0</p>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Posts</p>
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
