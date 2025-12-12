import React, { useState, useEffect } from 'react';
import { HiPlus, HiFire, HiArrowTrendingUp, HiPhoto, HiLink, HiMagnifyingGlass, HiChatBubbleLeftRight, HiHome, HiUserGroup } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import ForumPostCard from './ForumPostCard';
import CreateForumModal from './CreateForumModal';
import CreatePostModal from './CreatePostModal';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';

const ForumHome = () => {
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [forums, setForums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isCreateForumOpen, setIsCreateForumOpen] = useState(false);
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('latest'); // latest, trending, top

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [postsRes, forumsRes] = await Promise.all([
                api.get('/forums/posts/feed?page=1&limit=10'),
                api.get('/forums')
            ]);
            setPosts(postsRes.data.posts);
            setHasMore(postsRes.data.page < postsRes.data.pages);
            setForums(Array.isArray(forumsRes.data) ? forumsRes.data : []);
        } catch (error) {
            console.error("Failed to fetch forum data", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const res = await api.get(`/forums/posts/feed?page=${nextPage}&limit=10`);
            setPosts(prev => [...prev, ...res.data.posts]);
            setPage(nextPage);
            setHasMore(res.data.page < res.data.pages);
        } catch (error) {
            console.error("Failed to load more posts", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.get(`/forums/posts/search?q=${searchQuery}`);
            setPosts(res.data);
        } catch (error) {
            console.error("Failed to search", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostUpdate = (updatedPost) => {
        setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
    };

    const handleNewPost = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
    };

    const handleNewForum = (newForum) => {
        setForums(prev => [...prev, newForum]);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Main Content Area - Feed (Left) */}
            <div className="lg:col-span-8 space-y-6">
                {/* Search Bar - Mobile optimized */}
                <form onSubmit={handleSearch} className="relative group">
                    <input
                        type="text"
                        placeholder="Search discussions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all shadow-sm group-hover:shadow-md"
                    />
                    <HiMagnifyingGlass className="absolute left-4 top-4 text-gray-400 w-5 h-5 group-hover:text-blue-500 transition-colors" />
                </form>

                {/* Mobile Actions (Visible <= lg) */}
                <div className="lg:hidden grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setIsCreatePostOpen(true)}
                        className="bg-gray-900 text-white font-bold py-3 rounded-xl shadow-lg shadow-gray-200/50 flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        <HiPlus className="w-5 h-5" />
                        Create Post
                    </button>
                    <button
                        onClick={() => setIsCreateForumOpen(true)}
                        className="bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        <HiUserGroup className="w-5 h-5" />
                        Create Community
                    </button>
                </div>

                {/* Filter Bar - Sticky */}
                <div className="sticky top-16 z-30 bg-gray-50/95 backdrop-blur-sm py-2 mx-[-1rem] px-4 md:mx-0 md:px-0">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        <button
                            onClick={() => setFilter('latest')}
                            className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${filter === 'latest' ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/20' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                            <HiPlus className="w-4 h-4" />
                            Latest
                        </button>
                        <button
                            onClick={() => setFilter('trending')}
                            className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${filter === 'trending' ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                            <HiFire className={`w-4 h-4 ${filter !== 'trending' && 'text-orange-500'}`} />
                            Trending
                        </button>
                        <button
                            onClick={() => setFilter('top')}
                            className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${filter === 'top' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                            <HiArrowTrendingUp className="w-4 h-4" />
                            Top
                        </button>
                    </div>
                </div>

                {/* Posts Feed */}
                <div className="space-y-6 min-h-[50vh]">
                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                                            <div className="h-3 bg-gray-200 rounded w-1/4" />
                                        </div>
                                    </div>
                                    <div className="h-32 bg-gray-200 rounded-xl mt-4" />
                                </div>
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mx-4 lg:mx-0 min-h-[600px] flex flex-col justify-center items-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <HiChatBubbleLeftRight className="w-10 h-10 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No discussions yet</h3>
                            <p className="text-gray-500 max-w-md mx-auto">Be the first to start a meaningful conversation in the community!</p>
                        </div>
                    ) : (
                        posts.map(post => (
                            <Link key={post._id} to={`/forums/post/${post._id}`} className="block transform transition-all hover:scale-[1.01] duration-200">
                                <ForumPostCard post={post} onVote={handlePostUpdate} />
                            </Link>
                        ))
                    )}

                    {hasMore && !loading && (
                        <div className="flex justify-center pt-8 pb-12">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="px-8 py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-full hover:bg-gray-50 hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {loadingMore && <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />}
                                {loadingMore ? 'Loading...' : 'Load More Posts'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar (Desktop Only) - Sticky */}
            <div className="hidden lg:block lg:col-span-4 space-y-4 sticky top-20 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar">
                {/* Forum Home Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative group">
                    <div className="h-20 bg-gradient-to-br from-gray-900 to-gray-800 relative">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="absolute bottom-[-20px] left-5">
                            <div className="w-14 h-14 bg-white rounded-2xl p-1 shadow-lg transform rotate-3 transition-transform group-hover:rotate-0">
                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <HiHome className="w-7 h-7 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 px-5 pb-5">
                        <h2 className="font-bold text-lg text-gray-900 mb-1">Forum Home</h2>
                        <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                            Your frontpage to the community.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setIsCreatePostOpen(true)}
                                className="bg-gray-900 hover:bg-black text-white font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-gray-200/50 flex flex-col items-center justify-center gap-0.5"
                            >
                                <HiPlus className="w-4 h-4" />
                                <span className="text-[10px]">Create Post</span>
                            </button>
                            <button
                                onClick={() => setIsCreateForumOpen(true)}
                                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-lg transition-all flex flex-col items-center justify-center gap-0.5"
                            >
                                <HiUserGroup className="w-4 h-4" />
                                <span className="text-[10px]">Create Forum</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Trending Communities */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-orange-100 rounded-md">
                                <HiFire className="w-4 h-4 text-orange-500" />
                            </div>
                            <h3 className="font-bold text-sm text-gray-900">Trending Now</h3>
                        </div>
                        <Link to="/forums/explore" className="text-[10px] font-bold text-blue-600 hover:underline">
                            View All
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {forums.slice(0, 5).map((forum, index) => (
                            <Link key={forum._id} to={`/forums/${forum._id}`} className="flex items-center gap-3 group p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
                                <span className="text-xs font-bold text-gray-400 w-3 text-center">{index + 1}</span>
                                <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm relative">
                                    {forum.icon ? (
                                        <img src={forum.icon} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 font-bold text-[10px] uppercase">
                                            {forum.name.substring(0, 2)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition truncate">{forum.name}</p>
                                    <p className="text-[10px] text-gray-500 truncate">{forum.members?.length || 0} members</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateForumModal
                isOpen={isCreateForumOpen}
                onClose={() => setIsCreateForumOpen(false)}
                onCreated={handleNewForum}
            />
            <CreatePostModal
                isOpen={isCreatePostOpen}
                onClose={() => setIsCreatePostOpen(false)}
                forums={forums}
                onCreated={handleNewPost}
            />
        </div>
    );
};

export default ForumHome;
