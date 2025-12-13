import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProfileHero from './ProfileHero';
import AboutSection from './AboutSection';
import ProjectsSection from './ProjectsSection';
import TeamsSection from './TeamsSection';
import PostsSection from './PostsSection';
import AchievementsSection from './AchievementsSection';
import SocialLinks from './SocialLinks';
import ProfileScore from './ProfileScore';
import EventsSection from './EventsSection';
import PendingInvites from '../Team_page/PendingInvites';
import SuggestedConnections from './SuggestedConnections';
import api from '../../api/axios';
import InviteToTeamModal from './InviteToTeamModal';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const { username } = useParams();
    const { currentUser: firebaseUser } = useAuth(); // Get Firebase user
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null); // The backend user
    const [loading, setLoading] = useState(true);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [viewAsPublic, setViewAsPublic] = useState(false); // Only for owner
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const [invites, setInvites] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch the profile to display
                let endpoint = '/users/profile';
                if (username) {
                    endpoint = `/users/${username}`;
                }
                const profileRes = await api.get(endpoint);
                const profileData = profileRes.data;

                // 2. Fetch current user (me) to check ownership and following status
                let meData = null;
                try {
                    const meRes = await api.get('/users/profile');
                    meData = meRes.data;
                    setCurrentUser(meData);
                } catch (e) {
                    console.error("Failed to fetch current user", e);
                }

                setUser(profileData);

                // 3. Determine Ownership
                if (username && meData) {
                    const isMe = profileData._id === meData._id;
                    setIsOwnProfile(isMe);
                    if (isMe) {
                        setIsFollowing(false);
                    } else {
                        setIsFollowing(profileData.followers.includes(meData._id));
                    }
                } else {
                    // /profile route -> It's me
                    setIsOwnProfile(true);
                    setIsFollowing(false);
                }

                // 4. Fetch "Invites" (Team Invites)
                try {
                    const invitesRes = await api.get('/teams/invites');
                    const mappedInvites = invitesRes.data.map(team => ({
                        id: team._id,
                        name: team.name,
                        skill: team.category || 'Team Invite',
                        img: team.createdBy?.profilePic || '', // Use creator's pic or team avatar if available
                        type: 'team'
                    }));
                    setInvites(mappedInvites);
                } catch (e) {
                    console.error("Failed to fetch invites", e);
                }

            } catch (err) {
                console.error("Failed to fetch profile", err);

                // FALLBACK: If backend fails but we have Firebase user, use that!
                if (firebaseUser && (!username || username === firebaseUser.email?.split('@')[0])) {
                    console.log("Using Firebase user fallback");
                    const fallbackUser = {
                        _id: firebaseUser.uid,
                        name: firebaseUser.displayName,
                        username: firebaseUser.email?.split('@')[0],
                        email: firebaseUser.email,
                        profilePic: firebaseUser.photoURL,
                        followers: [],
                        following: [],
                        skills: [],
                        bio: "Welcome to your profile!",
                        profession: "Member",
                        stats: { followers: 0, following: 0 },
                        projects: [], // Initialize empty arrays for fallback
                        teams: []
                    };
                    setUser(fallbackUser);
                    setIsOwnProfile(true);
                } else {
                    if (err.response && err.response.status === 404) {
                        setUser(null);
                    } else {
                        setUser(null);
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [username, firebaseUser]);

    const handleFollow = async () => {
        if (!user || isOwnProfile) return;

        try {
            await api.put(`/users/${user._id}/follow`);
            setIsFollowing(!isFollowing);
            setUser(prev => ({
                ...prev,
                followers: isFollowing
                    ? prev.followers.filter(id => id !== currentUser._id)
                    : [...prev.followers, currentUser._id]
            }));
        } catch (err) {
            console.error("Failed to follow/unfollow", err);
        }
    };

    const handleAcceptInvite = async (teamId) => {
        try {
            await api.put(`/teams/${teamId}/accept`);
            toast.success("Joined team successfully!");
            setInvites(prev => prev.filter(i => i.id !== teamId));
            // Optionally refresh profile to show new team
        } catch (err) {
            console.error("Failed to accept invite", err);
            toast.error("Failed to accept invite");
        }
    };

    const handleDeclineInvite = async (teamId) => {
        try {
            await api.put(`/teams/${teamId}/decline`);
            toast.success("Invite declined");
            setInvites(prev => prev.filter(i => i.id !== teamId));
        } catch (err) {
            console.error("Failed to decline invite", err);
            toast.error("Failed to decline invite");
        }
    };

    const toggleViewMode = () => {
        setViewAsPublic(!viewAsPublic);
    };

    const handleProfileUpdate = (updatedData) => {
        setUser(prevUser => ({
            ...prevUser,
            ...updatedData,
            profilePic: updatedData.profilePic !== undefined ? updatedData.profilePic : prevUser.profilePic,
            bannerPic: updatedData.bannerPic !== undefined ? updatedData.bannerPic : prevUser.bannerPic
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
                    <p className="text-gray-600 mt-2">Please log in or check the username.</p>
                </div>
            </div>
        );
    }

    const showOwnerControls = isOwnProfile && !viewAsPublic;

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'teams', label: 'Teams' },
        { id: 'projects', label: 'Projects' },
        { id: 'events', label: 'Events' },
        { id: 'posts', label: 'Posts' },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ProfileHero
                    user={user}
                    isOwner={showOwnerControls}
                    isOwnProfile={isOwnProfile}
                    isFollowing={isFollowing}
                    onFollow={handleFollow}
                    onInvite={() => setIsInviteModalOpen(true)}
                    onToggleView={toggleViewMode}
                    onProfileUpdate={handleProfileUpdate}
                />

                {/* Tab Navigation */}
                <div className="sticky top-16 z-20 bg-gray-50 pt-6 pb-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 flex overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 px-6 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-6">
                        {activeTab === 'overview' && (
                            <>
                                <AboutSection user={user} />
                                {/* Mobile-only widgets for Overview */}
                                <div className="lg:hidden space-y-6">
                                    {showOwnerControls && (
                                        <PendingInvites
                                            invites={invites}
                                            onAccept={handleAcceptInvite}
                                            onDecline={handleDeclineInvite}
                                        />
                                    )}
                                    {showOwnerControls && <ProfileScore user={user} />}
                                    {!showOwnerControls && <SuggestedConnections />}
                                    <AchievementsSection user={user} />
                                    <SocialLinks user={user} />
                                </div>
                            </>
                        )}
                        {activeTab === 'teams' && <TeamsSection user={user} />}
                        {activeTab === 'projects' && <ProjectsSection user={user} />}
                        {activeTab === 'events' && <EventsSection />}
                        {activeTab === 'posts' && <PostsSection isOwner={showOwnerControls} user={user} currentUser={currentUser} />}
                    </div>

                    {/* Desktop Sidebar - Always visible on large screens, hidden on mobile */}
                    <div className="hidden lg:block lg:col-span-4 space-y-6">
                        {showOwnerControls && (
                            <PendingInvites
                                invites={invites}
                                onAccept={handleAcceptInvite}
                                onDecline={handleDeclineInvite}
                            />
                        )}
                        {showOwnerControls && <ProfileScore user={user} />}
                        {!showOwnerControls && <SuggestedConnections />}
                        <AchievementsSection user={user} />
                        <SocialLinks user={user} />
                    </div>
                </div>
            </div>

            <InviteToTeamModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                userToInvite={user}
            />
        </div>
    );
};

export default Profile;