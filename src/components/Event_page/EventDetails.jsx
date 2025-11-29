import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaTrophy, FaUser, FaArrowLeft } from 'react-icons/fa';
import api from '../../api/axios';
import Avatar from '../common/Avatar';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isJoined, setIsJoined] = useState(false);
    const [joinLoading, setJoinLoading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const { data } = await api.get(`/events`);
                // Since we don't have a get-single-event endpoint yet (or maybe we do, let's check routes),
                // wait, the routes file showed router.route('/:id').put(...). It didn't show a GET /:id.
                // The GET / was for all events.
                // I need to check if I need to add GET /:id to backend.
                // Looking at eventRoutes.js from previous turn:
                // router.route('/').post(...).get(...)
                // router.route('/:id').put(..., updateEvent)
                // It seems GET /:id is MISSING.
                // I will need to add it. For now, I'll assume I'll add it.

                // Actually, let's double check the file content I saw earlier.
                // Step 1172: router.route('/:id').put(...)
                // It does NOT have .get().

                // So I need to implement getEventById in backend first?
                // Or I can filter from the list if I have to, but that's bad practice.
                // I will implement GET /api/events/:id in backend.

                // For this file creation, I will assume the endpoint exists.
                const res = await api.get(`/events/${id}`); // This will fail until I add the route
                setEvent(res.data);

                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (userInfo) {
                    setCurrentUserId(userInfo._id);
                    if (res.data.attendees.some(att => (att._id || att) === userInfo._id)) {
                        setIsJoined(true);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch event details", err);
                setError("Failed to load event details.");
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [id]);

    const handleJoin = async () => {
        if (isJoined) return;

        setJoinLoading(true);
        try {
            await api.put(`/events/${id}/join`);
            setIsJoined(true);
            // Optionally refresh data to show updated attendee count
            setEvent(prev => ({ ...prev, attendees: [...prev.attendees, currentUserId] }));
        } catch (error) {
            console.error("Failed to join event", error);
            alert("Failed to join event");
        } finally {
            setJoinLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error || !event) return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Event not found</h2>
            <p className="text-gray-600 mb-6">{error || "The event you're looking for doesn't exist."}</p>
            <button onClick={() => navigate('/events')} className="text-blue-600 hover:underline">
                Back to Events
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-6 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/events')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition"
                >
                    <FaArrowLeft className="mr-2" /> Back to Events
                </button>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
                    {/* Cover Image */}
                    <div className="h-64 sm:h-80 md:h-96 w-full relative bg-gray-100">
                        {event.imageUrl ? (
                            <img
                                src={event.imageUrl}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-lg font-medium text-gray-400">No cover image</span>
                                </div>
                            </div>
                        )}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-800 shadow-sm">
                            {event.category}
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                                <div className="flex flex-wrap gap-4 text-gray-600 mt-3">
                                    <div className="flex items-center">
                                        <FaCalendarAlt className="mr-2 text-blue-500" />
                                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                    <div className="flex items-center">
                                        <FaMapMarkerAlt className="mr-2 text-red-500" />
                                        {event.location}
                                    </div>
                                    {event.prize && (
                                        <div className="flex items-center text-yellow-600 font-medium">
                                            <FaTrophy className="mr-2" />
                                            {event.prize}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleJoin}
                                disabled={joinLoading || isJoined}
                                className={`px-8 py-3 rounded-xl font-semibold shadow-sm transition flex-shrink-0 ${isJoined
                                    ? "bg-green-100 text-green-700 border border-green-200 cursor-default"
                                    : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                                    }`}
                            >
                                {joinLoading ? "Joining..." : isJoined ? "You are going!" : "Join Event"}
                            </button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-8">
                                <section>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">About this event</h3>
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                        {event.description}
                                    </p>
                                </section>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                        <FaUser className="mr-2 text-gray-500" /> Organizer
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            src={event.organizer?.profilePic}
                                            alt={event.organizer?.name || "Organizer"}
                                            size="md"
                                            className="ring-2 ring-white shadow-sm"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">{event.organizer?.name || "Unknown"}</p>
                                            <p className="text-sm text-gray-500">@{event.organizer?.username || "user"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                    <h3 className="font-semibold text-gray-900 mb-4">
                                        Attendees <span className="ml-1 bg-gray-200 text-gray-700 py-0.5 px-2 rounded-full text-xs">{event.attendees?.length || 0}</span>
                                    </h3>
                                    <div className="flex -space-x-2 overflow-hidden py-1">
                                        {/* We might not have full attendee details populated, just IDs. 
                                            If we want to show avatars, we need to populate attendees in backend.
                                            For now, just show a count or placeholders if we don't have data.
                                        */}
                                        {event.attendees?.slice(0, 5).map((att, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-gray-300 ring-2 ring-white flex items-center justify-center text-xs font-medium text-gray-600">
                                                {/* Placeholder since we might only have IDs */}
                                                ?
                                            </div>
                                        ))}
                                        {(event.attendees?.length || 0) > 5 && (
                                            <div className="w-8 h-8 rounded-full bg-gray-100 ring-2 ring-white flex items-center justify-center text-xs font-medium text-gray-500">
                                                +{event.attendees.length - 5}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
