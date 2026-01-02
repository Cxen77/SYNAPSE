import React from "react";
import PropTypes from "prop-types";
import { FaCog, FaUserPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import MemberCard from "./MemberCard";

function TeamCard({ team, onInviteClick }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-white p-5 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Link to={`/teams/${team.id}`} className="hover:underline truncate max-w-full">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{team.teamName}</h2>
              </Link>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold whitespace-nowrap">
                {team.type}
              </span>
            </div>

            <p className="text-gray-600 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
              <span className="truncate">{team.project}</span>
            </p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onInviteClick}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition border border-blue-200 active:scale-95"
            >
              <FaUserPlus /> Invite
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition border border-gray-200 active:scale-95">
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

TeamCard.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    teamName: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    project: PropTypes.string,
    description: PropTypes.string,
    members: PropTypes.arrayOf(PropTypes.object).isRequired,
    isAdmin: PropTypes.bool
  }).isRequired,
  onInviteClick: PropTypes.func.isRequired
};

export default TeamCard;
