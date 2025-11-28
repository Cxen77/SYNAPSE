import React, { useState, useEffect } from "react";
import ProfileCard from "./ProfileCard";
import Feed from "./Feed";
import Recommendations from "./Recommendations";
import api from "../../api/axios";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* top padding if you have a fixed navbar */}
      <div className="pt-20 px-6">
        <div className="max-w-[1300px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6">
            <ProfileCard user={user} loading={loading} />
            <Feed user={user} />
            <Recommendations />
          </div>
        </div>
      </div>
    </div>
  );
}
