import React, { useState, useEffect } from 'react';
import { FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';
import api from '../../api/axios';

export default function OrganizerEventsTab() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get('/organizer/events/my');
                setEvents(res.data);
            } catch (err) {
                console.error("Failed to fetch organizer events", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading) {
        return <div className="text-gray-400 dark:text-gray-500 p-8 text-center animate-pulse">Loading events...</div>;
    }

    if (events.length === 0) {
        return (
            <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-center">
                <p className="text-gray-400 dark:text-gray-500">You haven't created any events yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <div key={event._id} className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition duration-300 shadow-sm hover:shadow-md">
                        <div className="h-40 overflow-hidden bg-gray-100 dark:bg-gray-800">
                            {event.imageUrl ? (
                                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/40 to-slate-900">
                                    <FiCalendar className="w-10 h-10 text-indigo-500/50" />
                                </div>
                            )}
                        </div>
                        <div className="p-5">
                            <span className="inline-block px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-semibold rounded mb-3">
                                {event.category}
                            </span>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{event.title}</h3>
                            <div className="space-y-2 text-sm text-gray-400 dark:text-gray-500">
                                <div className="flex items-center gap-2">
                                    <FiCalendar className="shrink-0" />
                                    <span>{new Date(event.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiMapPin className="shrink-0" />
                                    <span className="line-clamp-1">{event.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiUsers className="shrink-0" />
                                    <span>{event.attendees?.length || 0} Registered</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
