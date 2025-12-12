import React, { useState } from 'react';
import api from '../../api/axios';
import Avatar from '../common/Avatar';
import { FaTrophy, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

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
    organizer,
    attendees = [],
    date, // Assuming date is passed
    location // Assuming location is passed
  } = eventData;

  const [isJoined, setIsJoined] = useState(() => {
    return attendees.some(att => (att._id || att) === currentUserId);
  });
  const [loading, setLoading] = useState(false);

  const organizerId = organizer?._id || organizer;
  const isOrganizer = currentUserId && organizerId === currentUserId;

  const handleJoin = async (e) => {
    e.stopPropagation(); // Prevent card click
    if (isJoined) return;

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

  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : null;

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full hover:-translate-y-1 cursor-pointer"
      onClick={() => window.location.href = `/events/${_id}`}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {eventImageUrl ? (
          <img
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            src={eventImageUrl}
            alt={eventName}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
            <FaCalendarAlt className="text-blue-200 text-4xl" />
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

        {/* Date Badge */}
        {formattedDate && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold text-gray-900 shadow-sm">
            {formattedDate}
          </div>
        )}

        {/* Edit Button */}
        {isOrganizer && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(eventData); }}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full text-gray-700 hover:text-blue-600 shadow-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1">
        {/* Organizer */}
        <div className="flex items-center space-x-2 mb-3">
          <Avatar src={organizerAvatar} alt={organizerName} size="xs" className="ring-2 ring-white" />
          <span className="text-xs font-medium text-gray-500 truncate">{organizerName}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
          {eventName}
        </h3>

        {/* Prize / Info */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          {eventPrize && (
            <div className="flex items-center gap-1.5 text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-md">
              <FaTrophy className="text-xs" />
              <span>{eventPrize}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-1">
          {eventDescription}
        </p>

        {/* Footer Action */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <div className="flex -space-x-2">
            {attendees.slice(0, 3).map((att, i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                <img src={att.profilePic || `https://ui-avatars.com/api/?name=${att.name || 'U'}`} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {attendees.length > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] text-gray-500 font-medium">
                +{attendees.length - 3}
              </div>
            )}
          </div>

          <button
            onClick={handleJoin}
            disabled={loading || isJoined}
            className={`px-5 py-2 text-sm rounded-xl font-semibold transition-all shadow-sm flex items-center gap-2 ${isJoined
                ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                : "bg-gray-900 text-white hover:bg-black hover:shadow-md hover:-translate-y-0.5"
              }`}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isJoined ? (
              <><span>Joined</span><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></>
            ) : (
              "Join Event"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cards;