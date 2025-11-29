import React from "react";
import { FaUserFriends, FaUsers, FaBookmark, FaCalendarAlt } from "react-icons/fa";
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

  if (!user) return null;

  const displayUser = user;
  const banner = displayUser.bannerPic || displayUser.coverImage;
  const subtitle = displayUser.profession || (displayUser.course ? `${displayUser.course} Student` : "Student");

  return (
    <aside className="bg-white rounded-xl shadow-sm p-5 sticky top-[72px] self-start border border-gray-200 overflow-hidden">
      {/* Header image */}
      <div className="h-24 -mx-5 -mt-5 bg-gradient-to-r from-blue-50 to-purple-50 mb-4 relative">
        {banner && (
          <img
            src={banner}
            alt="cover"
            className="w-full h-full object-cover opacity-100"
          />
        )}
      </div>

      {/* profile */}
      <div className="flex flex-col items-center -mt-16 relative z-10">
        <Link to="/profile">
          <Avatar
            src={displayUser.profilePic}
            alt={displayUser.name}
            size="custom"
            className="w-24 h-24 border-4 border-white shadow-md bg-white hover:opacity-90 transition"
          />
        </Link>
        <Link to="/profile">
          <h3 className="mt-3 text-lg font-bold text-gray-900 hover:text-blue-600 transition">{displayUser.name}</h3>
        </Link>
        <p className="text-sm text-gray-600 text-center px-4">{subtitle}</p>
      </div>

      {/* stats / nav */}
      <div className="mt-6 space-y-1 text-sm">
        <div className="flex justify-between items-center text-gray-600 hover:bg-gray-50 p-2 rounded-lg transition cursor-pointer group">
          <span className="group-hover:text-blue-600 transition">Profile views</span>
          <span className="font-bold text-blue-600">1,245</span>
        </div>
        <div className="flex justify-between items-center text-gray-600 hover:bg-gray-50 p-2 rounded-lg transition cursor-pointer group">
          <span className="group-hover:text-blue-600 transition">Post impressions</span>
          <span className="font-bold text-blue-600">17,826</span>
        </div>

        <hr className="my-4 border-gray-100" />

        <ul className="space-y-1 text-sm">
          <li className="flex items-center gap-3 text-gray-700 hover:bg-blue-50 p-2 rounded-lg transition cursor-pointer group">
            <FaUserFriends className="text-gray-400 group-hover:text-blue-500 transition" />
            <span className="font-medium group-hover:text-blue-700 transition">My Network</span>
          </li>
          <li className="flex items-center gap-3 text-gray-700 hover:bg-blue-50 p-2 rounded-lg transition cursor-pointer group">
            <FaUsers className="text-gray-400 group-hover:text-blue-500 transition" />
            <span className="font-medium group-hover:text-blue-700 transition">Groups</span>
          </li>
          <li className="flex items-center gap-3 text-gray-700 hover:bg-blue-50 p-2 rounded-lg transition cursor-pointer group">
            <FaBookmark className="text-gray-400 group-hover:text-blue-500 transition" />
            <span className="font-medium group-hover:text-blue-700 transition">Saved</span>
          </li>
          <li className="flex items-center gap-3 text-gray-700 hover:bg-blue-50 p-2 rounded-lg transition cursor-pointer group">
            <FaCalendarAlt className="text-gray-400 group-hover:text-blue-500 transition" />
            <span className="font-medium group-hover:text-blue-700 transition">Events</span>
          </li>
        </ul>

        <button className="mt-4 w-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 text-sm rounded-lg py-2.5 hover:from-blue-100 hover:to-purple-100 transition font-bold text-blue-700 shadow-sm">
          Try Premium for FREE
        </button>
      </div>
    </aside>
  );
}