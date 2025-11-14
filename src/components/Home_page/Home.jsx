import React from "react";
import ProfileCard from "./ProfileCard";
import Feed from "./Feed";
import Recommendations from "./Recommendations";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* top padding if you have a fixed navbar */}
      <div className="pt-20 px-6">
        <div className="max-w-[1300px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6">
            <ProfileCard />
            <Feed />
            <Recommendations />
          </div>
        </div>
      </div>
    </div>
  );
}
