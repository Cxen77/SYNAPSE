import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const TEAM_TYPES = [
    { label: 'All Types', value: 'all' },
    { label: 'Solo', value: 'solo' },
    { label: 'Auto-Team', value: 'auto' },
    { label: 'Pre-Team', value: 'pre' }
];

export default function OrganizerExportTab() {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [downloading, setDownloading] = useState(false);
    const [filters, setFilters] = useState({
        teamType: 'all',
        college: '',
        year: '',
        section: ''
    });

    useEffect(() => {
        api.get('/organizer/events/my').then(r => setEvents(r.data)).catch(() => { });
    }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleExport = async () => {
        if (!selectedEventId) return;
        setDownloading(true);

        // Build query params — only include non-empty filters
        const params = new URLSearchParams();
        if (filters.teamType) params.set('teamType', filters.teamType);
        if (filters.college) params.set('college', filters.college);
        if (filters.year) params.set('year', filters.year);
        if (filters.section) params.set('section', filters.section);

        try {
            const response = await api.get(
                `/organizer/events/${selectedEventId}/export?${params.toString()}`,
                { responseType: 'blob' }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `event-${selectedEventId}-participants.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('CSV exported successfully!');
        } catch (err) {
            toast.error('Failed to export participants.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Export Data</h2>
            <p className="text-gray-400 dark:text-gray-500 mb-8">Download a structured CSV with academic data and registration types.</p>

            {/* Event selector */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Select Event</label>
                <select
                    value={selectedEventId}
                    onChange={e => setSelectedEventId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                >
                    <option value="">-- Choose an Event --</option>
                    {events.map(ev => (
                        <option key={ev._id} value={ev._id}>{ev.title}</option>
                    ))}
                </select>
            </div>

            {/* Filter Controls */}
            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 mb-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Export Filters (Optional)</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Registration Type</label>
                        <select
                            name="teamType"
                            value={filters.teamType}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                        >
                            {TEAM_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">College (Partial match)</label>
                        <input
                            type="text"
                            name="college"
                            value={filters.college}
                            onChange={handleFilterChange}
                            placeholder="e.g. MIT"
                            className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Year (Exact)</label>
                        <input
                            type="text"
                            name="year"
                            value={filters.year}
                            onChange={handleFilterChange}
                            placeholder="e.g. 3rd"
                            className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Section (Exact)</label>
                        <input
                            type="text"
                            name="section"
                            value={filters.section}
                            onChange={handleFilterChange}
                            placeholder="e.g. A"
                            className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={handleExport}
                disabled={!selectedEventId || downloading}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-medium transition"
            >
                <FiDownload />
                {downloading ? 'Preparing Download...' : 'Export to CSV'}
            </button>
        </div>
    );
}
