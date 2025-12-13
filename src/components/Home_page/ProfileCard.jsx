import React from "react";
import { HiUserGroup, HiUsers, HiBookmark, HiCalendar } from "react-icons/hi";
import { Link } from "react-router-dom";
import Avatar from "../common/Avatar";

export default function ProfileCard({ user, loading }) {
  if (loading) {
    return (
      <aside className="bg-white rounded-xl shadow-sm p-5 sticky top-28 border border-gray-200 overflow-hidden animate-pulse">
        <div className="h-24 -mx-5 -mt-5 bg-gray-200 mb-4"></div>
        <div className="flex flex-col items-center -mt-16 relative z-10">
          <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-300"></div>
          <div className="mt-3 h-6 w-32 bg-gray-200 rounded"></div>
          <div className="mt-2 h-4 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="mt-6 space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </aside>
    );
  }

  if (!user) {
    return (
      <aside className="bg-white rounded-xl shadow-sm p-5 sticky top-[72px] self-start border border-gray-200">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
            <HiUsers className="text-gray-400 text-3xl" />
          </div>
          <h3 className="font-bold text-gray-900">Welcome!</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">Sign in to see your profile</p>
          <Link to="/login" className="block w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 transition">
            Sign In
          </Link>
        </div>
      </aside>
    );
  }

  const displayUser = user;
  const banner = displayUser.bannerPic || displayUser.coverImage;
  const subtitle = displayUser.profession || (displayUser.course ? `${displayUser.course} Student` : "Student");

  // Real stats with safeguards
  const followersCount = displayUser.followers?.length || 0;
  const followingCount = displayUser.following?.length || 0;

  return (
    <aside className="bg-white rounded-xl shadow-sm p-5 sticky top-[72px] self-start border border-gray-200 overflow-hidden group">
      {/* Header image - Dark Theme */}
      <div className="h-24 -mx-5 -mt-5 bg-gray-900 relative overflow-hidden mb-4">
        {banner ? (
          <>
            <img
              src={banner}
              alt="cover"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
          </>
        ) : (
          <>
            {/* Animated Blobs for "Premium" look */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-8 left-0 w-32 h-32 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          </>
        )}
      </div>

      {/* profile */}
      <div className="flex flex-col items-center -mt-16 relative z-10">
        <Link to="/profile">
          <Avatar
            src={displayUser.profilePic}
            alt={displayUser.name}
            size="custom"
            className="w-24 h-24 border-4 border-white shadow-md bg-white hover:opacity-90 transition object-cover"
          />
        </Link>
        <Link to="/profile">
          <h3 className="mt-3 text-lg font-bold text-gray-900 hover:text-blue-600 transition">{displayUser.name}</h3>
        </Link>
        <p className="text-sm text-gray-600 text-center px-4">{subtitle}</p>
      </div>

      {/* Stats Row */}
      <div className="mt-6 flex items-center justify-around border-b border-gray-100 pb-4 mb-4">
        <Link to="/profile" className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition w-full cursor-pointer">
          <span className="font-bold text-gray-900 text-lg">{followersCount}</span>
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Followers</span>
        </Link>
        <div className="w-[1px] h-8 bg-gray-100"></div>
        <Link to="/profile" className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition w-full cursor-pointer">
          <span className="font-bold text-gray-900 text-lg">{followingCount}</span>
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Following</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <ul className="space-y-1 text-sm">
        <li className="flex items-center gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 p-2.5 rounded-lg transition cursor-pointer group">
          <HiUserGroup className="text-gray-400 group-hover:text-blue-600 transition w-5 h-5" />
          <span className="font-medium group-hover:text-blue-600 transition">My Network</span>
        </li>
        <li className="flex items-center gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 p-2.5 rounded-lg transition cursor-pointer group">
          <HiUsers className="text-gray-400 group-hover:text-blue-600 transition w-5 h-5" />
          <span className="font-medium group-hover:text-blue-600 transition">Groups</span>
        </li>
        <li className="flex items-center gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 p-2.5 rounded-lg transition cursor-pointer group">
          <HiBookmark className="text-gray-400 group-hover:text-blue-600 transition w-5 h-5" />
          <span className="font-medium group-hover:text-blue-600 transition">Saved Items</span>
        </li>
        <li className="flex items-center gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 p-2.5 rounded-lg transition cursor-pointer group">
          <HiCalendar className="text-gray-400 group-hover:text-blue-600 transition w-5 h-5" />
          <span className="font-medium group-hover:text-blue-600 transition">Events</span>
        </li>
        <Link to="/forums" className="flex items-center gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 p-2.5 rounded-lg transition cursor-pointer group">
          <HiUserGroup className="text-gray-400 group-hover:text-blue-600 transition w-5 h-5" />
          <span className="font-medium group-hover:text-blue-600 transition">Forums</span>
        </Link>
      </ul>
    </aside>
  );
}