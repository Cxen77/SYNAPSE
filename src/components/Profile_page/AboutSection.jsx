import React from 'react';
import { FaGraduationCap, FaBriefcase, FaLightbulb } from 'react-icons/fa';

const AboutSection = ({ user }) => {
    if (!user) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">About</h3>
            </div>

            <div className="p-6 space-y-6">
                {/* Bio */}
                <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Bio</h4>
                    <p className="text-gray-700 leading-relaxed">{user.bio || "No bio added yet."}</p>
                </div>

                {/* Skills */}
                <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                        {user.skills && user.skills.length > 0 ? (
                            user.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 rounded-full text-sm font-semibold hover:from-blue-200 hover:to-purple-200 transition"
                                >
                                    {skill}
                                </span>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No skills added yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutSection;
