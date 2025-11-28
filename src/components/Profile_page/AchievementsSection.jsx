import React from 'react';
import userData from '../userdata';

const AchievementsSection = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-yellow-50 to-white border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Achievements</h3>
            </div>

            <div className="p-2">
                <div className="space-y-2">
                    {userData.achievements.map((achievement) => (
                        <div
                            key={achievement.id}
                            className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                        >
                            {/* Icon Box */}
                            <div className={`w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br ${achievement.color} text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                {achievement.icon}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 text-sm truncate">{achievement.title}</h4>
                                <p className="text-xs text-gray-500">{achievement.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AchievementsSection;
