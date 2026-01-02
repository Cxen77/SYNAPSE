import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaTrophy, FaUser, FaArrowLeft, FaBolt } from 'react-icons/fa';
import api from '../../api/axios';
import Avatar from '../common/Avatar';
import TeamList from './TeamList';
import AutoTeamModal from './AutoTeamModal';
import { useAuth } from '../../context/AuthContext'; // Need auth for user data
import MatchFoundModal from './MatchFoundModal';
import { useSocket } from '../../context/SocketContext'; // Need socket for real-time updates

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, loading: authLoading } = useAuth(); // Get loading state from auth
    const { socket } = useSocket(); // Get socket instance
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isJoined, setIsJoined] = useState(false);
    const [isQueued, setIsQueued] = useState(null); // Initialize as null (loading)
    const [joinLoading, setJoinLoading] = useState(false); // Added for handleJoin
    const [showAutoTeamModal, setShowAutoTeamModal] = useState(false); // Added for AutoTeamModal

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                let fetchedEvent = null;
                // 1. Fetch Event
                // Try direct fetch first for better performance and reliability
                try {
                    const res = await api.get(`/events/${id}`);
                    fetchedEvent = res.data;
                    setEvent(fetchedEvent);
                } catch (err) {
                    // Fallback to list fetch if individual endpoint fails (or not implemented)
                    const { data } = await api.get(`/events`);
                    fetchedEvent = data.events?.find(e => e._id === id);
                    if (fetchedEvent) {
                        setEvent(fetchedEvent);
                    } else {
                        throw new Error("Event not found");
                    }
                }

                // 2. Check Event Attendance
                if (currentUser && fetchedEvent) {
                    // Re-check attendance from the fetched event data
                    const userIsAttending = fetchedEvent.attendees.some(att => (att._id || att) === currentUser._id);
                    setIsJoined(userIsAttending);
                } else {
                    setIsJoined(false); // Not logged in or event not found
                }

            } catch (err) {
                console.error("Failed to fetch event details", err);
                setError("Failed to load event details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchEventDetails();
    }, [id, currentUser]); // Added currentUser to dependencies for isJoined check

    // Separate effect for Queue Status to depend on currentUser (Auth)
    useEffect(() => {
        const checkQueue = async () => {
            if (authLoading) return; // Wait for auth to initialize

            if (currentUser && id) {
                try {
                    const qRes = await api.get(`/autoteam/${id}/status`);
                    setIsQueued(qRes.data.isQueued);
                } catch (qErr) {
                    console.error("Failed to check queue status", qErr);
                    setIsQueued(false);
                }
            } else {
                setIsQueued(false); // Not logged in -> Not queued
            }
        };
        checkQueue();
    }, [id, currentUser, authLoading]);

    const [matchData, setMatchData] = useState(null);
    const [showMatchModal, setShowMatchModal] = useState(false);

    // Listen for real-time match events
    useEffect(() => {
        if (!socket) return;

        const handleTeamFound = (data) => {
            // console.log("Team Found Socket Event:", data);
            if (data.teamId) {
                setMatchData(data);
                setShowMatchModal(true);
                // Also update queue state
                setIsQueued(false);
                setIsJoined(true); // Technically they are now in a team
            }
        };

        socket.on('team:found', handleTeamFound);

        return () => {
            socket.off('team:found', handleTeamFound);
        };
    }, [socket]);

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

                            {/* Auto Team Button */}
                            {!isJoined && isQueued !== null && (
                                <button
                                    onClick={() => !isQueued && setShowAutoTeamModal(true)}
                                    disabled={isQueued}
                                    className={`px-6 py-3 rounded-xl font-bold flex-shrink-0 transition flex items-center gap-2 shadow-sm ${isQueued
                                        ? "bg-blue-50 text-blue-600 border border-blue-200 cursor-default"
                                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md hover:scale-105 active:scale-95"
                                        }`}
                                >
                                    {isQueued ? (
                                        <>
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                            </span>
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <FaBolt className="text-yellow-300" />
                                            Auto Match
                                        </>
                                    )}
                                </button>
                            )}
                            {!isJoined && isQueued === null && (
                                <div className="h-12 w-36 bg-gray-100 rounded-xl animate-pulse"></div>
                            )}

                            {/* Delete Button (Organizer Only) */}
                            {currentUser && event.organizer && (currentUser._id === (event.organizer._id || event.organizer)) && (
                                <button
                                    onClick={async () => {
                                        if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
                                            try {
                                                await api.delete(`/events/${id}`);
                                                navigate('/events');
                                            } catch (err) {
                                                alert('Failed to delete event');
                                                console.error(err);
                                            }
                                        }
                                    }}
                                    className="px-6 py-3 rounded-xl font-semibold text-red-600 bg-red-50 hover:bg-red-100 hover:shadow-md transition border border-red-200 flex-shrink-0"
                                >
                                    Delete Event 🗑️
                                </button>
                            )}
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

                        {/* Event Teams Section */}
                        <TeamList eventId={event._id} />
                    </div>
                </div>
            </div>

            {showAutoTeamModal && (
                <AutoTeamModal
                    eventId={id}
                    user={currentUser} // Fix: use currentUser, userInfo was undefined in my read, verifying... 
                    // Wait, previous file had 'user={userInfo}'. I need to check if userInfo is defined. 
                    // In lines 1-15, only 'currentUser' is from useAuth. 
                    // So 'userInfo' was likely a bug or from a variable I missed. 
                    // I will use 'currentUser' which contains profile data usually.
                    onClose={() => setShowAutoTeamModal(false)}
                    onJoined={() => {
                        setIsQueued(true);
                    }}
                />
            )}

            <MatchFoundModal
                isOpen={showMatchModal}
                onClose={() => setShowMatchModal(false)}
                matchData={matchData}
            />
        </div>
    );
};

export default EventDetails;
