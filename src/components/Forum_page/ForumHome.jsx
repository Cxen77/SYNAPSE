import React, { useState, useEffect } from 'react';
import { HiPlus, HiFire, HiTrendingUp, HiPhotograph, HiLink } from 'react-icons/hi';
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
    const [forums, setForums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateForumOpen, setIsCreateForumOpen] = useState(false);
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [postsRes, forumsRes] = await Promise.all([
                api.get('/forums/posts/feed'),
                api.get('/forums')
            ]);
            setPosts(postsRes.data);
            setForums(forumsRes.data);
        } catch (error) {
            console.error("Failed to fetch forum data", error);
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-8 space-y-6">
                {/* Create Post Card */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex gap-3 mb-3">
                        <Avatar src={currentUser?.profilePic} alt={currentUser?.name} size="md" />
                        <button
                            onClick={() => setIsCreatePostOpen(true)}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-left px-4 py-2.5 rounded-full text-gray-500 font-medium transition focus:outline-none"
                        >
                            What's on your mind?
                        </button>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 px-2">
                        <div className="flex gap-2">
                            <button onClick={() => setIsCreatePostOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600 text-sm font-medium transition">
                                <HiPhotograph className="text-blue-500 w-5 h-5" />
                                Photo
                            </button>
                            <button onClick={() => setIsCreatePostOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600 text-sm font-medium transition">
                                <HiLink className="text-green-500 w-5 h-5" />
                                Link
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                        <button className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-900 rounded-md text-sm font-bold shadow-sm transition">
                            <HiFire className="w-4 h-4 text-orange-500" />
                            Hot
                        </button>
                        <button className="flex items-center gap-2 px-4 py-1.5 text-gray-500 hover:bg-gray-50 rounded-md text-sm font-bold transition">
                            <HiTrendingUp className="w-4 h-4" />
                            Top
                        </button>
                        <button className="flex items-center gap-2 px-4 py-1.5 text-gray-500 hover:bg-gray-50 rounded-md text-sm font-bold transition">
                            <HiPlus className="w-4 h-4" />
                            New
                        </button>
                    </div>
                </div>

                {/* Posts Feed */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiPlus className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No posts yet</h3>
                            <p className="text-gray-500">Be the first to start a conversation!</p>
                        </div>
                    ) : (
                        posts.map(post => (
                            <ForumPostCard key={post._id} post={post} onVote={handlePostUpdate} />
                        ))
                    )}
                </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
                {/* About / Create Community */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                    <div className="h-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    </div>
                    <div className="px-5 pb-5">
                        <div className="flex items-center gap-3 -mt-8 mb-4 relative z-10">
                            <div className="w-16 h-16 bg-white rounded-xl p-1 shadow-md">
                                <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center border border-gray-100">
                                    <HiTrendingUp className="text-blue-600 w-8 h-8" />
                                </div>
                            </div>
                            <h2 className="font-bold text-xl text-gray-900 mt-6">Forum Home</h2>
                        </div>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            Your personal Synapse frontpage. Come here to check in with your favorite communities and discover new discussions.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => setIsCreatePostOpen(true)}
                                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 rounded-lg transition shadow-sm"
                            >
                                Create Post
                            </button>
                            <button
                                onClick={() => setIsCreateForumOpen(true)}
                                className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-2.5 rounded-lg transition"
                            >
                                Create Community
                            </button>
                        </div>
                    </div>
                </div>

                {/* Trending Communities */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Trending Communities</h3>
                    <div className="space-y-4">
                        {forums.slice(0, 5).map((forum) => (
                            <Link key={forum._id} to={`/forums/${forum._id}`} className="flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                    {forum.icon ? (
                                        <img src={forum.icon} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 font-bold text-xs">
                                            r/
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition truncate">r/{forum.name}</p>
                                    <p className="text-xs text-gray-500">{forum.members.length} members</p>
                                </div>
                                <button className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition">
                                    Join
                                </button>
                            </Link>
                        ))}
                    </div>
                    <button className="w-full mt-4 text-sm font-bold text-gray-500 hover:text-gray-900 transition py-2">
                        View All
                    </button>
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
