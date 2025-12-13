import React, { useState, useEffect } from "react";
import ProfileCard from "./ProfileCard";
import Feed from "./Feed";
import Recommendations from "./Recommendations";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function Home() {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return; // Wait for Firebase user

      try {
        const { data } = await api.get('/users/profile');
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  // Use backend user if available, otherwise fallback to Firebase currentUser
  const displayUser = user || (currentUser ? {
    name: currentUser.displayName,
    email: currentUser.email,
    profilePic: currentUser.photoURL,
    username: currentUser.email?.split('@')[0],
    profession: "Member"
  } : null);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* top padding if you have a fixed navbar */}
      <div className="px-6 pt-[8px]">
        <div className="max-w-[1300px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6">
            {/* Left Sidebar */}
            <div className="hidden lg:block sticky top-24 h-fit">
              <ProfileCard user={displayUser} loading={loading} />
            </div>

            {/* Middle Feed */}
            <div>
              <Feed user={displayUser} />
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block sticky top-24 h-fit">
              <Recommendations />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
