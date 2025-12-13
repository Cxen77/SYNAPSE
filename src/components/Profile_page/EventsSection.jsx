import React from 'react';
import userData from '../userdata';
import { FaCalendar, FaTrophy, FaCertificate } from 'react-icons/fa';

const EventsSection = () => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Upcoming':
                return 'bg-blue-100 text-blue-700';
            case 'Participated':
                return 'bg-green-100 text-green-700';
            case 'Completed':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Hackathon':
                return <FaTrophy className="text-yellow-500" />;
            case 'Workshop':
                return <FaCertificate className="text-blue-500" />;
            case 'Conference':
                return <FaCalendar className="text-purple-500" />;
            default:
                return <FaCalendar className="text-gray-500" />;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-blue-600 rounded-full block"></span>
                        Events & Hackathons
                    </h3>
                    <span className="bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs font-bold border border-gray-200">
                        {userData.events.length}
                    </span>
                </div>
            </div>

            <div className="p-6">
                <div className="space-y-4">
                    {userData.events.map((event) => (
                        <div
                            key={event.id}
                            className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300"
                        >
                            {/* Event Image */}
                            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                                <img
                                    src={event.image}
                                    alt={event.name}
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                />
                            </div>

                            {/* Event Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="text-xl">{getTypeIcon(event.type)}</div>
                                        <h4 className="text-lg font-bold text-gray-900">{event.name}</h4>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(event.status)}`}>
                                        {event.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <FaCalendar className="w-4 h-4" />
                                    <span>{event.date}</span>
                                    <span>•</span>
                                    <span className="font-medium">{event.type}</span>
                                </div>

                                {event.achievement && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <FaTrophy className="text-yellow-500 w-4 h-4" />
                                        <span className="text-sm font-semibold text-gray-900">{event.achievement}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EventsSection;
