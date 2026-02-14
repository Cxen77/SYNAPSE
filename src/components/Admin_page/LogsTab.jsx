import { useState, useEffect } from 'react';
import { FiClock, FiChevronLeft, FiChevronRight, FiUser, FiTarget } from 'react-icons/fi';
import api from '../../api/axios';

const actionColors = {
    ROLE_CHANGE: 'bg-blue-500/20 text-blue-400',
    SUSPEND_USER: 'bg-amber-500/20 text-amber-400',
    UNSUSPEND_USER: 'bg-emerald-500/20 text-emerald-400',
    SOFT_DELETE_USER: 'bg-red-500/20 text-red-400',
    APPROVE_EVENT: 'bg-emerald-500/20 text-emerald-400',
    REJECT_EVENT: 'bg-red-500/20 text-red-400',
    SOFT_DELETE_EVENT: 'bg-red-500/20 text-red-400',
    SOFT_DELETE_POST: 'bg-red-500/20 text-red-400',
    SOFT_DELETE_FORUM_POST: 'bg-red-500/20 text-red-400',
    UPDATE_SETTINGS: 'bg-violet-500/20 text-violet-400',
};

export default function LogsTab() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/admin/logs?page=${page}&limit=20`);
            setLogs(data.logs);
            setTotalPages(data.pages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogs(); }, [page]);

    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHr = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHr / 24);

        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHr < 24) return `${diffHr}h ago`;
        if (diffDay < 7) return `${diffDay}d ago`;
        return d.toLocaleDateString();
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <FiClock className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Audit Logs</h2>
            </div>

            <div className="admin-glass rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-4 space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-16 bg-slate-700/30 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center text-slate-500 py-12">No audit logs yet</div>
                ) : (
                    <div className="divide-y divide-white/[0.04]">
                        {logs.map(log => (
                            <div key={log._id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`admin-badge ${actionColors[log.action] || 'bg-slate-500/20 text-slate-400'}`}>
                                                {log.action?.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <FiUser className="w-3 h-3" />
                                                {log.adminId?.name || log.adminId?.username || 'System'}
                                            </span>
                                        </div>
                                        {log.details && (
                                            <p className="text-xs text-slate-400 mt-1.5 truncate">{log.details}</p>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-slate-500 whitespace-nowrap flex items-center gap-1">
                                        <FiClock className="w-3 h-3" />
                                        {formatTime(log.createdAt)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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
