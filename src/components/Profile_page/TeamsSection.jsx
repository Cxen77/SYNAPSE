import React from 'react';
import { Users, ArrowRight, Briefcase } from 'lucide-react';

const TeamsSection = ({ user }) => {
    const teams = user?.teams || [];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-orange-50 to-white border-b border-gray-200 flex items-center gap-3">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <Briefcase className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Teams</h3>
                    <p className="text-sm text-gray-600">Member of {teams.length} teams</p>
                </div>
            </div>

            <div className="p-6">
                {teams.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No teams joined yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teams.map((team) => (
                            <div
                                key={team._id || team.id}
                                className="p-5 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Team Avatar */}
                                    <img
                                        src={team.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(team.name)}&background=random`}
                                        alt={team.name}
                                        className="w-16 h-16 rounded-full object-cover ring-2 ring-white shadow-md"
                                    />

                                    {/* Team Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="text-lg font-bold text-gray-900 truncate">{team.name}</h4>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold whitespace-nowrap ml-2">
                                                {team.category || "Team"}
                                            </span>
                                        </div>

                                        <p className="text-sm font-semibold text-blue-600 mb-2">
                                            {team.admins && team.admins.includes(user._id) ? "Admin" : "Member"}
                                        </p>

                                        {team.description && (
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{team.description}</p>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Users className="w-4 h-4" />
                                                <span className="font-medium">{Array.isArray(team.members) ? team.members.length : (team.members || 0)} members</span>
                                            </div>

                                            <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                                                View Team
                                                <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamsSection;
