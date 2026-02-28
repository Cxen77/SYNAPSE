import React from 'react';
import { FaGraduationCap, FaBriefcase, FaLightbulb } from 'react-icons/fa';

const AboutSection = ({ user }) => {
    if (!user) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
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
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                    <FaGraduationCap className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                {user.college && <h5 className="font-bold text-gray-900 text-[17px] leading-tight mb-1">{user.college}</h5>}
                                {user.course && <span className="text-gray-700 font-medium mb-0.5">{user.course}</span>}
                                {(user.year || user.section) && (
                                    <span className="text-gray-500 text-sm flex items-center gap-2 mt-0.5">
                                        {user.year ? `${user.year} Semester` : ''}
                                        {user.year && user.section && <span className="w-1 h-1 bg-gray-300 rounded-full"></span>}
                                        {user.section ? `Section ${user.section}` : ''}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No education details added.</p>
                    )}
                </div>

                {/* Skills */}
                <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Skills</h4>
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                        {user.skills && user.skills.length > 0 ? (
                            <>
                                {user.skills.slice(0, 50).map((skill, index) => (
                                    <span
                                        key={index}
                                        className="whitespace-nowrap flex-shrink-0 px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition"
                                    >
                                        {skill}
                                    </span>
                                ))}
                                {user.skills.length > 50 && (
                                    <span className="whitespace-nowrap flex-shrink-0 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-full text-sm font-medium">
                                        + {user.skills.length - 50} more
                                    </span>
                                )}
                            </>
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
