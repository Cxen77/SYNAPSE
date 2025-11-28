import React from 'react';
import userData from '../userdata';
import { FaCheckCircle, FaCircle } from 'react-icons/fa';

const ProfileScore = () => {
    const { percentage, completed, pending } = userData.profileScore;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Profile Strength</h3>
                <p className="text-sm text-gray-600 mt-1">Complete your profile to stand out</p>
            </div>

            <div className="p-6">
                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">Profile Completeness</span>
                        <span className="text-2xl font-bold text-blue-600">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                            style={{ width: `${percentage}%` }}
                        >
                            {percentage >= 20 && (
                                <span className="text-xs font-bold text-white">{percentage}%</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Completed Items */}
                <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FaCheckCircle className="text-green-500" />
                        Completed
                    </h4>
                    <div className="space-y-2">
                        {completed.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                <FaCheckCircle className="text-green-500 w-4 h-4 flex-shrink-0" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending Items */}
                {pending.length > 0 && (
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <FaCircle className="text-gray-400" />
                            To Complete
                        </h4>
                        <div className="space-y-2">
                            {pending.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                    <FaCircle className="text-gray-400 w-3 h-3 flex-shrink-0" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Call to Action */}
                {percentage < 100 && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-900 font-medium">
                            Complete your profile to increase visibility and get better team matches!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileScore;
