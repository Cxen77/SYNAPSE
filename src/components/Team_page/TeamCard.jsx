import React from "react";
import { FaCog, FaUserPlus } from "react-icons/fa";
import MemberCard from "./MemberCard";

function TeamCard({ team, onInviteClick }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-white p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{team.teamName}</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                {team.type}
              </span>
            </div>

            <p className="text-gray-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              {team.project}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onInviteClick}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition border border-blue-200"
            >
              <FaUserPlus /> Invite
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition border border-gray-200">
              <FaCog /> Manage
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600 font-medium">
          {team.members.length} members
        </div>
      </div>

      {/* Members */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {team.members.map((member, index) => (
            <MemberCard key={index} member={member} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeamCard;
