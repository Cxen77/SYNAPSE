import React from 'react';
import { FaGraduationCap, FaBriefcase, FaLightbulb } from 'react-icons/fa';

const AboutSection = ({ user }) => {
    if (!user) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-blue-600 rounded-full block"></span>
                    About
                </h3>
            </div>

            <div className="p-6 space-y-6">
                {/* Bio */}
                <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Bio</h4>
                    <p className="text-gray-700 leading-relaxed">{user.bio || "No bio added yet."}</p>
                </div>

                {/* Education */}
                <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Education</h4>
                    {user.college || user.course ? (
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="p-3 bg-white rounded-lg shadow-sm text-blue-600">
                                <FaGraduationCap className="w-6 h-6" />
                            </div>
                            <div>
                                {user.college && <div className="font-bold text-gray-900 text-lg">{user.college}</div>}
                                {user.course && <div className="text-gray-700 font-medium">{user.course}</div>}
                                {user.year && <div className="text-gray-500 text-sm mt-1">{user.year}</div>}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No education details added.</p>
                    )}
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
