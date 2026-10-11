import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Editor from '../certificate/Editor';
import {
  FiCalendar,
  FiUsers,
  FiCheckCircle,
  FiMaximize2,
  FiMinimize2,
  FiRefreshCw,
  FiAward,
  FiLayers
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function OrganizerCertificatesTab() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [attendanceFilter, setAttendanceFilter] = useState('all'); // 'all' | 'attended'
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch organizer's events
  useEffect(() => {
    setLoadingEvents(true);
    api.get('/organizer/events/my')
      .then((res) => {
        setEvents(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedEventId(res.data[0]._id);
        }
      })
      .catch((err) => {
        console.error('Failed to load organizer events', err);
        toast.error('Could not load your events');
      })
      .finally(() => setLoadingEvents(false));
  }, []);

  const selectedEvent = useMemo(
    () => events.find((e) => e._id === selectedEventId),
    [events, selectedEventId]
  );

  // Fetch participants when selected event changes
  useEffect(() => {
    if (!selectedEventId || selectedEventId === 'custom') {
      setParticipants([]);
      return;
    }

    setLoadingParticipants(true);
    api.get(`/organizer/events/${selectedEventId}/participants`)
      .then((res) => {
        const list = res.data?.participants || [];
        setParticipants(list);
      })
      .catch((err) => {
        console.warn('Failed to load participants for event', err);
        setParticipants([]);
      })
      .finally(() => setLoadingParticipants(false));
  }, [selectedEventId]);

  // Compute recipient list text based on attendance filter
  const recipientsText = useMemo(() => {
    if (!participants || participants.length === 0) return '';

    const filtered = participants.filter((p) => {
      if (attendanceFilter === 'attended') {
        return p.attended === true;
      }
      return true;
    });

    return filtered
      .map((p) => {
        const name = p.user?.name || p.name || 'Participant';
        const teamName = p.team?.name ? `, ${p.team.name}` : '';
        return `${name}${teamName}`;
      })
      .filter(Boolean)
      .join('\n');
  }, [participants, attendanceFilter]);

  // Format date helper
  const formattedEventDate = useMemo(() => {
    if (!selectedEvent?.date && !selectedEvent?.startDate) return 'March 14, 2026';
    const rawDate = selectedEvent.date || selectedEvent.startDate;
    try {
      return new Date(rawDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return String(rawDate);
    }
  }, [selectedEvent]);

  // Fields to inject into certificate canvas
  const initialFields = useMemo(() => {
    if (!selectedEvent) {
      return {
        eventTitle: 'Synapse Tech Symposium 2026',
        eventDate: 'March 14, 2026',
        organizer: currentUser?.college || 'Synapse Tech Club',
      };
    }

    return {
      eventTitle: selectedEvent.title || 'Synapse Event',
      eventDate: formattedEventDate,
      organizer: selectedEvent.organizer?.name || currentUser?.college || 'Synapse Organization',
    };
  }, [selectedEvent, formattedEventDate, currentUser]);

  const totalAttendees = participants.filter((p) => p.attended === true).length;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Event Sync Header Bar */}
      <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FiAward size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Certificate Studio
                </h2>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Canva Engine
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Design custom certificates with 28 templates, 35 categories, drag-and-drop elements, and bulk generation.
              </p>
            </div>
          </div>

          {/* Controls: Event Dropdown, Attendee Filter, Fullscreen Toggle */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Event Dropdown */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs">
                <FiCalendar className="text-blue-500 shrink-0" size={14} />
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="bg-transparent border-none outline-none text-gray-900 dark:text-white font-medium w-full cursor-pointer truncate"
                  disabled={loadingEvents}
                >
                  {events.length === 0 && (
                    <option value="">{loadingEvents ? 'Loading events…' : 'No events found'}</option>
                  )}
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id} className="dark:bg-[#1a1a1a]">
                      {ev.title}
                    </option>
                  ))}
                  <option value="custom" className="dark:bg-[#1a1a1a]">
                    -- Custom / Standalone Event --
                  </option>
                </select>
              </div>
            </div>

            {/* Attendance Filter Toggle */}
            {selectedEventId && selectedEventId !== 'custom' && (
              <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setAttendanceFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition font-medium ${
                    attendanceFilter === 'all'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title="Include all registered attendees"
                >
                  All ({participants.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAttendanceFilter('attended')}
                  className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 ${
                    attendanceFilter === 'attended'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title="Include only participants marked as attended"
                >
                  <FiCheckCircle size={12} />
                  Attended ({totalAttendees})
                </button>
              </div>
            )}

            {/* Sync Status Badge */}
            {loadingParticipants ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs border border-yellow-500/20">
                <FiRefreshCw className="animate-spin size-3" /> Syncing attendees…
              </span>
            ) : participants.length > 0 ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-xs border border-green-500/20 font-medium">
                <FiUsers size={13} /> {recipientsText.split('\n').filter(Boolean).length} Ready for Bulk Export
              </span>
            ) : null}

            {/* Fullscreen Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Open Studio Fullscreen'}
            >
              {isFullscreen ? <FiMinimize2 size={13} /> : <FiMaximize2 size={13} />}
              <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Canva-Style Certificate Editor Component */}
      <Editor
        isEmbedded={true}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        initialFields={initialFields}
        initialRecipients={recipientsText}
        customHeaderExtra={
          selectedEvent ? (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400">
              <span className="font-semibold truncate max-w-[200px]">
                {selectedEvent.title}
              </span>
              <span className="text-[11px] opacity-75">· {formattedEventDate}</span>
            </div>
          ) : null
        }
      />
    </div>
  );
}
