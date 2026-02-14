import { useState, useEffect } from 'react';
import { FiCalendar, FiCheck, FiX, FiTrash2, FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';
import api from '../../api/axios';

export default function EventsTab() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState('');
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/admin/events?page=${page}&limit=15&filter=${filter}&search=${search}`);
            setEvents(data.events);
            setTotalPages(data.pages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, [page, filter, search]);

    const handleAction = async (id, action) => {
        setActionLoading(id);
        try {
            if (action === 'delete') {
                if (!window.confirm('Soft-delete this event?')) {
                    setActionLoading(null);
                    return;
                }
                await api.delete(`/admin/events/${id}`);
            } else {
                await api.patch(`/admin/events/${id}/${action}`);
            }
            fetchEvents();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatus = (event) => {
        if (event.isDeleted) return { label: 'Deleted', cls: 'bg-slate-500/20 text-slate-400' };
        if (event.isApproved === true) return { label: 'Approved', cls: 'bg-emerald-500/20 text-emerald-400' };
        if (event.isApproved === false) return { label: 'Rejected', cls: 'bg-red-500/20 text-red-400' };
        return { label: 'Pending', cls: 'bg-amber-500/20 text-amber-400' };
    };

    const filters = [
        { value: '', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
    ];

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <FiCalendar className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-lg font-bold text-white">Event Moderation</h2>
                </div>
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="pl-9 pr-4 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all w-44"
                        />
                    </div>
                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1 border border-white/[0.04]">
                        {filters.map(f => (
                            <button
                                key={f.value}
                                onClick={() => { setFilter(f.value); setPage(1); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${filter === f.value
                                    ? 'bg-emerald-500/15 text-emerald-400'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="admin-glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full admin-table">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="text-left">Event</th>
                                <th className="text-left">Organizer</th>
                                <th className="text-center">Date</th>
                                <th className="text-center">Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5}><div className="h-10 bg-slate-700/30 rounded animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : events.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center text-slate-500 py-8">No events found</td>
                                </tr>
                            ) : events.map(event => {
                                const status = getStatus(event);
                                return (
                                    <tr key={event._id}>
                                        <td>
                                            <div>
                                                <p className="font-medium text-white text-sm truncate max-w-[200px]">{event.title}</p>
                                                <p className="text-xs text-slate-500">{event.category || 'Uncategorized'}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={event.organizer?.profilePic || `https://ui-avatars.com/api/?name=${event.organizer?.name || 'U'}&background=1e293b&color=94a3b8&size=24`}
                                                    alt=""
                                                    className="w-6 h-6 rounded-full object-cover border border-white/10"
                                                />
                                                <span className="text-xs text-slate-300">{event.organizer?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="text-center text-xs text-slate-400">
                                            {event.date ? new Date(event.date).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="text-center">
                                            <span className={`admin-badge ${status.cls}`}>{status.label}</span>
                                        </td>
                                        <td>
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Show Approve if not approved */}
                                                {event.isApproved !== true && !event.isDeleted && (
                                                    <button
                                                        onClick={() => handleAction(event._id, 'approve')}
                                                        disabled={actionLoading === event._id}
                                                        className="admin-btn admin-btn-emerald"
                                                        title="Approve"
                                                    >
                                                        <FiCheck className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                {/* Show Reject if not rejected */}
                                                {event.isApproved !== false && !event.isDeleted && (
                                                    <button
                                                        onClick={() => handleAction(event._id, 'reject')}
                                                        disabled={actionLoading === event._id}
                                                        className="admin-btn admin-btn-amber"
                                                        title="Reject"
                                                    >
                                                        <FiX className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                {!event.isDeleted && (
                                                    <button
                                                        onClick={() => handleAction(event._id, 'delete')}
                                                        disabled={actionLoading === event._id}
                                                        className="admin-btn admin-btn-red"
                                                        title="Soft Delete"
                                                    >
                                                        <FiTrash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                        <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="admin-btn admin-btn-blue disabled:opacity-30">
                                <FiChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="admin-btn admin-btn-blue disabled:opacity-30">
                                <FiChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
