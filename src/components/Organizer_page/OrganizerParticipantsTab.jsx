import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { FiUsers, FiUser, FiZap, FiGrid } from 'react-icons/fi';
import VerifiedBadge from '../common/VerifiedBadge';

const FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Solo', value: 'solo' },
    { label: 'Auto-Team', value: 'auto' },
    { label: 'Pre-Team', value: 'pre' }
];

const TYPE_COLORS = {
    solo: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    auto: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    pre: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20'
};

export default function OrganizerParticipantsTab() {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/organizer/events/my').then(r => setEvents(r.data)).catch(() => { });
    }, []);

    const fetchParticipants = useCallback(async (eventId, type) => {
        if (!eventId) return;
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/organizer/events/${eventId}/participants`, {
                params: { type }
            });
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load participants.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch when event or filter changes — all server-side
    useEffect(() => {
        fetchParticipants(selectedEventId, activeFilter);
    }, [selectedEventId, activeFilter, fetchParticipants]);

    const handleFilterChange = (value) => {
        setActiveFilter(value);
    };

    const totals = data?.totals || {};

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Event Participants</h2>

                {/* Event Selector */}
                <div className="mb-6 max-w-sm">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Select Event</label>
                    <select
                        value={selectedEventId}
                        onChange={e => { setSelectedEventId(e.target.value); setData(null); }}
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    >
                        <option value="">-- Choose an Event --</option>
                        {events.map(ev => (
                            <option key={ev._id} value={ev._id}>{ev.title}</option>
                        ))}
                    </select>
                </div>

                {/* Summary Stats */}
                {data && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-in fade-in duration-200">
                        {[
                            { label: 'Total', value: totals.total, icon: FiGrid, color: 'indigo' },
                            { label: 'Solo', value: totals.solo, icon: FiUser, color: 'amber' },
                            { label: 'Auto-Team', value: totals.auto, icon: FiZap, color: 'emerald' },
                            { label: 'Pre-Team', value: totals.pre, icon: FiUsers, color: 'violet' }
                        ].map(stat => (
                            <div key={stat.label} className={`bg-${stat.color}-500/10 border border-${stat.color}-500/20 rounded-xl p-4 text-center`}>
                                <p className={`text-3xl font-bold text-${stat.color}-400`}>{stat.value ?? '—'}</p>
                                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filter Toggle — dispatches server-side fetch */}
                {selectedEventId && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {FILTERS.map(f => (
                            <button
                                key={f.value}
                                onClick={() => handleFilterChange(f.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${activeFilter === f.value
                                    ? 'bg-indigo-600 border-indigo-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-gray-200'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Error */}
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                {/* Loading */}
                {loading && <p className="text-gray-400 animate-pulse">Loading participants...</p>}

                {/* Participant Table */}
                {!loading && data && (
                    <div className="animate-in fade-in duration-300 bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-x-auto">
                        {data.participants.length === 0 ? (
                            <p className="text-gray-400 dark:text-gray-500 text-center py-10">No participants found for this filter.</p>
                        ) : (
                            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300 min-w-[640px]">
                                <thead className="bg-gray-200/50 dark:bg-black text-xs uppercase text-gray-400 dark:text-gray-500">
                                    <tr>
                                        <th className="px-5 py-3">Name</th>
                                        <th className="px-5 py-3">Username</th>
                                        <th className="px-5 py-3">College</th>
                                        <th className="px-5 py-3">Year</th>
                                        <th className="px-5 py-3">Section</th>
                                        <th className="px-5 py-3">Team</th>
                                        <th className="px-5 py-3">Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.participants.map((p, i) => (
                                        <tr key={p.user._id || i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-white/5 dark:hover:bg-white/5 transition">
                                            <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">
                                                <div className="flex items-center gap-1.5">
                                                    <span>{p.user.name}</span>
                                                    <VerifiedBadge verified={p.user.collegeVerified} />
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">@{p.user.username}</td>
                                            <td className="px-5 py-3 text-gray-400 dark:text-gray-500">{p.user.college || 'N/A'}</td>
                                            <td className="px-5 py-3 text-gray-400 dark:text-gray-500">{p.user.year || '—'}</td>
                                            <td className="px-5 py-3 text-gray-400 dark:text-gray-500">{p.user.section || '—'}</td>
                                            <td className="px-5 py-3 text-gray-400 dark:text-gray-500">{p.teamInfo?.teamName || 'Solo'}</td>
                                            <td className="px-5 py-3">
                                                <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${TYPE_COLORS[p.registrationType]}`}>
                                                    {p.registrationType}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
