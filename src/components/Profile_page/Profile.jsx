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
import userData from '../userdata';
import api from '../../api/axios';
import InviteToTeamModal from './InviteToTeamModal';

const Profile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // The logged-in user
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewAsPublic, setViewAsPublic] = useState(false); // Only for owner
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

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
        // We always need this unless we are sure we are on /profile (which is me)
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
          // Viewing someone else (or myself via /profile/myusername)
          const isMe = profileData._id === meData._id;
          setIsOwnProfile(isMe);
          if (isMe) {
            // If it's me, I'm not following myself in the UI sense
            setIsFollowing(false);
          } else {
            // Check if I am following this user
            // profileData.followers contains IDs of followers
            setIsFollowing(profileData.followers.includes(meData._id));
          }
        } else {
          // /profile route -> It's me
          setIsOwnProfile(true);
          setIsFollowing(false);
        }

      } catch (err) {
        console.error("Failed to fetch profile", err);
        // Only fallback to demo data if it's NOT a 404 (e.g. network error)
        // OR if we explicitly want to support a "demo" mode
        if (err.response && err.response.status === 404) {
          setUser(null); // User not found
        } else {
          // Fallback for other errors (like network)
          const demoUser = {
            ...userData,
            _id: "demo-id",
            bannerPic: userData.coverImage,
            skills: userData.skills.map(s => s.name),
            followers: Array(userData.stats.followers).fill(null),
            following: Array(userData.stats.following).fill(null),
            name: userData.name || "Demo User",
            username: userData.username || "demouser"
          };
          setUser(demoUser);
          setIsOwnProfile(true); // Demo mode assumes owner
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  const handleFollow = async () => {
    if (!user || isOwnProfile) return;

    try {
      await api.put(`/users/${user._id}/follow`);

      // Update local state
      setIsFollowing(!isFollowing);

      // Update follower count in user object
      setUser(prev => ({
        ...prev,
        followers: isFollowing
          ? prev.followers.filter(id => id !== currentUser._id) // Remove my ID
          : [...prev.followers, currentUser._id] // Add my ID
      }));

    } catch (err) {
      console.error("Failed to follow/unfollow", err);
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
          <p className="text-gray-600 mt-2">The user you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  // Determine if we should show owner controls
  // We show owner controls if it IS my profile AND I am NOT viewing as public
  const showOwnerControls = isOwnProfile && !viewAsPublic;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ProfileHero
          user={user}
          isOwner={showOwnerControls} // Pass the calculated boolean
          isOwnProfile={isOwnProfile} // Pass the raw ownership status
          isFollowing={isFollowing}
          onFollow={handleFollow}
          onInvite={() => setIsInviteModalOpen(true)}
          onToggleView={toggleViewMode}
          onProfileUpdate={handleProfileUpdate}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-6">
            <AboutSection user={user} />
            <ProjectsSection />
            <TeamsSection />
            <PostsSection isOwner={showOwnerControls} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {showOwnerControls && <PendingInvites invites={userData.invites} />}
            {showOwnerControls && <ProfileScore />}
            {!showOwnerControls && <SuggestedConnections />}
            <AchievementsSection />
            <EventsSection />
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