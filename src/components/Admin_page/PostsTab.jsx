import { useState, useEffect } from 'react';
import { FiFileText, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../../api/axios';

export default function PostsTab() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/admin/posts?page=${page}&limit=15`);
            setPosts(data.posts);
            setTotalPages(data.pages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(); }, [page]);

    const handleDelete = async (id) => {
        if (!window.confirm('Soft-delete this post? Content will be cleared.')) return;
        setActionLoading(id);
        try {
            await api.delete(`/admin/posts/${id}`);
            fetchPosts();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <FiFileText className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Post Moderation</h2>
            </div>

            <div className="admin-glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full admin-table">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="text-left">Author</th>
                                <th className="text-left">Content</th>
                                <th className="text-center">Likes</th>
                                <th className="text-center">Status</th>
                                <th className="text-center">Date</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6}><div className="h-10 bg-slate-700/30 rounded animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : posts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center text-slate-500 py-8">No posts found</td>
                                </tr>
                            ) : posts.map(post => (
                                <tr key={post._id}>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={post.user?.profilePic || `https://ui-avatars.com/api/?name=${post.user?.name || 'U'}&background=1e293b&color=94a3b8&size=24`}
                                                alt=""
                                                className="w-6 h-6 rounded-full object-cover border border-white/10"
                                            />
                                            <span className="text-xs text-slate-300">{post.user?.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="text-sm text-slate-300 truncate max-w-[250px]">{post.content || '(no content)'}</p>
                                    </td>
                                    <td className="text-center">
                                        <span className="text-xs text-slate-400">{post.likes?.length || 0}</span>
                                    </td>
                                    <td className="text-center">
                                        <span className={`admin-badge ${post.isDeleted ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                            {post.isDeleted ? 'Deleted' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="text-center text-xs text-slate-500">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleDelete(post._id)}
                                                disabled={actionLoading === post._id || post.isDeleted}
                                                className="admin-btn admin-btn-red disabled:opacity-30"
                                                title="Soft Delete"
                                            >
                                                <FiTrash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
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
