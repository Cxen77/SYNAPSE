import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HiPlus, HiUserGroup, HiInformationCircle, HiShieldCheck } from 'react-icons/hi';
import api from '../../api/axios';
import ForumPostCard from './ForumPostCard';
import CreatePostModal from './CreatePostModal';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Avatar from '../common/Avatar';

const ForumDetails = () => {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const [forum, setForum] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    const [isMember, setIsMember] = useState(false);

    useEffect(() => {
        fetchForumData();
    }, [id]);

    useEffect(() => {
        if (forum && currentUser) {
            setIsMember(forum.members.includes(currentUser._id));
        }
    }, [forum, currentUser]);

    const fetchForumData = async () => {
        try {
            const [forumRes, postsRes] = await Promise.all([
                api.get(`/forums/${id}`),
                api.get(`/forums/${id}/posts`)
            ]);
            setForum(forumRes.data);
            setPosts(postsRes.data);
        } catch (error) {
            console.error("Failed to fetch forum details", error);
            toast.error("Failed to load community");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinLeave = async () => {
        try {
            if (isMember) {
                await api.put(`/forums/${id}/leave`);
                setIsMember(false);
                setForum(prev => ({ ...prev, members: prev.members.filter(m => m !== currentUser._id) }));
                toast.success(`Left r/${forum.name}`);
            } else {
                await api.put(`/forums/${id}/join`);
                setIsMember(true);
                setForum(prev => ({ ...prev, members: [...prev.members, currentUser._id] }));
                toast.success(`Joined r/${forum.name}`);
            }
        } catch (error) {
            console.error("Failed to join/leave forum", error);
            toast.error("Action failed");
        }
    };

    const handlePostUpdate = (updatedPost) => {
        setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
    };

    const handleNewPost = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!forum) return <div className="text-center py-20 text-gray-500">Community not found</div>;

    return (
        <div>
            {/* Hero Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                {/* Banner */}
                <div className="h-48 relative">
                    {forum.banner ? (
                        <img src={forum.banner} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/10"></div>
                        </div>
                    )}
                </div>

                {/* Info Bar */}
                <div className="px-6 pb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-5 -mt-10 relative z-10">
                        {/* Icon */}
                        <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg">
                            {forum.icon ? (
                                <img src={forum.icon} alt="" className="w-full h-full rounded-xl object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl border border-blue-100">
                                    r/
                                </div>
                            )}
                        </div>

                        {/* Title & Actions */}
                        <div className="flex-1 w-full md:w-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                    {forum.name}
                                </h1>
                                <p className="text-gray-500 font-medium">r/{forum.name}</p>
                            </div>

                            <div className="flex gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => setIsCreatePostOpen(true)}
                                    className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition shadow-sm"
                                >
                                    Create Post
                                </button>
                                <button
                                    onClick={handleJoinLeave}
                                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-full font-bold transition shadow-sm ${isMember
                                            ? 'bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                                            : 'bg-gray-900 text-white hover:bg-gray-800'
                                        }`}
                                >
                                    {isMember ? 'Joined' : 'Join Community'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Create Post Trigger */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3 cursor-pointer hover:border-gray-300 transition" onClick={() => setIsCreatePostOpen(true)}>
                        <Avatar src={currentUser?.profilePic} alt={currentUser?.name} size="md" />
                        <input
                            type="text"
                            placeholder="Create Post"
                            className="flex-1 bg-gray-100 border-transparent rounded-full px-5 py-2.5 hover:bg-white hover:border-gray-300 transition focus:outline-none cursor-pointer"
                            readOnly
                        />
                        <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-full transition">
                            <HiPhotograph className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Posts */}
                    <div className="space-y-6">
                        {posts.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <HiPlus className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No posts yet</h3>
                                <p className="text-gray-500">Be the first to post in r/{forum.name}!</p>
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
                    {/* About Community */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <span className="font-bold text-gray-900 text-sm">About Community</span>
                            <HiInformationCircle className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="p-5">
                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">{forum.description}</p>

                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                                <div className="flex-1">
                                    <div className="text-xl font-bold text-gray-900">{forum.members.length}</div>
                                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Members</div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-xl font-bold text-green-500">
                                        <div className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2 mb-1"></div>
                                        Online
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Status</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                                <HiShieldCheck className="w-4 h-4" />
                                <span>Created {new Date(forum.createdAt).toLocaleDateString()}</span>
                            </div>

                            <button
                                onClick={() => setIsCreatePostOpen(true)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-full transition shadow-sm"
                            >
                                Create Post
                            </button>
                        </div>
                    </div>

                    {/* Rules */}
                    {forum.rules && forum.rules.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-sm text-gray-900">
                                r/{forum.name} Rules
                            </div>
                            <div className="divide-y divide-gray-100">
                                {forum.rules.map((rule, index) => (
                                    <div key={index} className="p-4 text-sm text-gray-600 flex gap-3 hover:bg-gray-50 transition">
                                        <span className="font-bold text-gray-900 min-w-[20px]">{index + 1}.</span>
                                        <span>{rule}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <CreatePostModal
                isOpen={isCreatePostOpen}
                onClose={() => setIsCreatePostOpen(false)}
                forums={[forum]}
                defaultForumId={forum._id}
                onCreated={handleNewPost}
            />
        </div>
    );
};

export default ForumDetails;
