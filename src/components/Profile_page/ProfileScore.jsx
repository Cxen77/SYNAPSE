import React, { useMemo } from 'react';
import { FaCheckCircle, FaCircle } from 'react-icons/fa';

const ProfileScore = ({ user }) => {
    const { score, completed, pending } = useMemo(() => {
        if (!user) return { score: 0, completed: [], pending: [] };

        const checks = [
            { label: "Profile Picture", isComplete: !!user.profilePic },
            { label: "Banner Image", isComplete: !!user.bannerPic },
            { label: "Bio", isComplete: !!user.bio },
            { label: "Skills", isComplete: user.skills && user.skills.length > 0 },
            { label: "Projects", isComplete: user.projects && user.projects.length > 0 },
            { label: "Teams", isComplete: user.teams && user.teams.length > 0 },
            { label: "Social Links", isComplete: user.socials && Object.values(user.socials).some(link => !!link) }
        ];

        const completedItems = checks.filter(c => c.isComplete);
        const pendingItems = checks.filter(c => !c.isComplete);
        const calculatedScore = Math.round((completedItems.length / checks.length) * 100);

        return {
            score: calculatedScore,
            completed: completedItems.map(c => c.label),
            pending: pendingItems.map(c => c.label)
        };
    }, [user]);

    if (score === 100) return null;

    const getProgressColor = (percent) => {
        if (percent < 40) return 'bg-red-500';
        if (percent < 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const progressColor = getProgressColor(score);
    const textColor = progressColor.replace('bg-', 'text-');

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-blue-600 rounded-full block"></span>
                    Profile Strength
                </h3>
                <span className={`text-lg font-bold ${textColor}`}>{score}%</span>
            </div>

            <div className="p-6">
                {/* Progress Bar */}
                <div className="mb-6 relative pt-1">
                    <div className="overflow-hidden h-2.5 mb-2 text-xs flex rounded-full bg-gray-100">
                        <div
                            style={{ width: `${score}%` }}
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${progressColor} transition-all duration-1000 ease-out`}
                        ></div>
                    </div>
                </div>

                {/* Pending Items (Priority) */}
                {pending.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <FaCircle className="text-orange-500 w-3 h-3" />
                            Action Items
                        </h4>
                        <div className="space-y-3">
                            {pending.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group hover:border-blue-200 transition-colors">
                                    <span className="text-sm font-medium text-gray-700">{item}</span>
                                    <button className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Call to Action */}
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <p className="text-sm text-blue-900 font-medium leading-relaxed">
                        Complete your profile to increase visibility by <span className="font-bold">3x</span>!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfileScore;
