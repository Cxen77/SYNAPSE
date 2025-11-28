import React from 'react';
import { FaUserPlus } from 'react-icons/fa';
import userData from '../userdata';

const SuggestedConnections = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">People You Might Know</h3>
                <p className="text-sm text-gray-600 mt-1">Based on your interests</p>
            </div>

            <div className="p-4">
                <div className="space-y-4">
                    {userData.suggestedConnections.map((person) => (
                        <div key={person.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img
                                    src={person.avatar}
                                    alt={person.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{person.name}</h4>
                                    <p className="text-xs text-gray-500">{person.role}</p>
                                    <p className="text-xs text-gray-400">{person.mutual} mutual connections</p>
                                </div>
                            </div>
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition">
                                <FaUserPlus className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    View All Suggestions
                </button>
            </div>
        </div>
    );
};

export default SuggestedConnections;
