import React, { useState } from 'react';
import api from '../../api/axios';

const Cards = ({ eventData, onEdit, currentUserId }) => {
  const {
    _id,
    organizerName,
    organizerTitle,
    organizerAvatar,
    eventImageUrl,
    eventName,
    eventPrize,
    eventDescription,
    organizer, // Assuming this is the ID or object with _id
    attendees = [],
  } = eventData;

  // If we have the current user ID, we could check if they are in attendees.
  // For now, let's assume the parent passes a boolean or we just rely on the button action.
  // Actually, we need to know if the user has joined to show "Joined".
  // Let's add local state for this.

  const [isJoined, setIsJoined] = useState(() => {
    return attendees.some(att => (att._id || att) === currentUserId);
  });
  const [loading, setLoading] = useState(false);

  // Check if organizer is an object or string ID
  const organizerId = organizer?._id || organizer;
  const isOrganizer = currentUserId && organizerId === currentUserId;

  const handleJoin = async () => {
    if (isJoined) return; // Already joined (or handle leave)

    setLoading(true);
    try {
      await api.put(`/events/${_id}/join`);
      setIsJoined(true);
    } catch (error) {
      console.error("Failed to join event", error);
      alert("Failed to join event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden my-4 mx-4 sm:mx-auto max-w-sm border border-gray-200 flex flex-col h-full">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img className="w-10 h-10 rounded-full ring-2 ring-gray-100 object-cover" src={organizerAvatar} alt="" />
          <div>
            <p className="font-semibold text-gray-900 truncate max-w-[150px]">{organizerName}</p>
            <p className="text-xs text-gray-500 truncate max-w-[150px]">{organizerTitle}</p>
          </div>
        </div>
        {isOrganizer && (
          <button
            onClick={() => onEdit(eventData)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full transition"
          >
            Edit
          </button>
        )}
      </div>

      <div className="relative h-48 bg-gray-100">
        {eventImageUrl ? (
          <img className="h-full w-full object-cover" src={eventImageUrl} alt={eventName} />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm mb-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-400">No image available</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h2 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{eventName}</h2>
        <p className="text-md font-medium text-blue-600 mb-2">{eventPrize}</p>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">{eventDescription}</p>

        <div className="flex justify-end space-x-3 mt-auto">
          <button
            onClick={() => window.location.href = `/events/${_id}`}
            className="px-6 py-2 text-sm border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition"
          >
            View
          </button>
          <button
            onClick={handleJoin}
            disabled={loading || isJoined}
            className={`px-6 py-2 text-sm rounded-full transition shadow-sm font-medium ${isJoined
              ? "bg-green-100 text-green-700 border border-green-200 cursor-default"
              : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
          >
            {loading ? "Joining..." : isJoined ? "Joined" : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cards;