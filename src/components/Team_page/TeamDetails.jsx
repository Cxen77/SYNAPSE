import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUsers, FaProjectDiagram, FaUserShield, FaClock } from 'react-icons/fa';
import api from '../../api/axios';
import Avatar from '../common/Avatar';
import Skeleton from '../common/Skeleton';
import toast from 'react-hot-toast';

const TeamDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                // Try to get specific team. If backend doesn't support getById, we might need to fetch all and find.
                // Assuming /teams/:id exists or we add it. 
                // Previous check of teamRoutes.js would confirm, but let's try direct first or fallback.
                const { data } = await api.get(`/teams/${id}`);
                setTeam(data);
            } catch (err) {
                console.error("Failed to fetch team details", err);
                setError("Failed to load team details");

                // Fallback: If 404/500, maybe try fetching all and filtering?
                // Ideally backend should support getById.
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchTeam();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 px-4 max-w-5xl mx-auto">
                <Skeleton className="h-8 w-32 mb-6" />
                <Skeleton className="h-64 w-full rounded-2xl mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Team Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || "This team doesn't exist or you verify you have access."}</p>
                    <button
                        onClick={() => navigate('/teams')}
                        className="text-blue-600 hover:text-blue-700 font-semibold flex items-center justify-center gap-2"
                    >
                        <FaArrowLeft /> Back to Teams
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header Actions */}
                <button
                    onClick={() => navigate('/teams')}
                    className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                >
                    <FaArrowLeft className="mr-2" /> Back to Teams
                </button>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    {/* Banner / Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 sm:p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-10 -translate-y-10">
                            <FaUsers size={150} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                    {team.visibility}
                                </span>
                                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                                    <FaProjectDiagram /> {team.category}
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">{team.name}</h1>
                            <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
                                {team.description || "No description provided."}
                            </p>
                        </div>
                    </div>

                    {/* Stats / Info Bar */}
                    <div className="bg-white border-b border-gray-100 px-8 py-4 flex flex-wrap gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <FaUserShield className="text-blue-500" />
                            <span>Created by <span className="font-semibold text-gray-900">{team.createdBy?.name || "Unknown"}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaUsers className="text-green-500" />
                            <span>{team.members?.length || 0} Members</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaClock className="text-purple-500" />
                            <span>Active usually</span>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="p-8 grid md:grid-cols-3 gap-8">
                        {/* Left: Members */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                                Team Members
                            </h3>

                            <div className="grid sm:grid-cols-2 gap-4">
                                {team.members?.map((member) => (
                                    <div key={member._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all bg-white group cursor-pointer" onClick={() => navigate(`/users/${member.username}`)}>
                                        <Avatar
                                            src={member.profilePic}
                                            alt={member.name}
                                            size="md"
                                            className="ring-2 ring-white group-hover:ring-blue-100 transition-all"
                                        />
                                        <div>
                                            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{member.name}</p>
                                            <p className="text-xs text-gray-500">{member.role || "Member"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Actions/Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4">Admin Actions</h3>
                                <button className="w-full py-2.5 px-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors mb-3 shadow-sm text-sm">
                                    Edit Team Details
                                </button>
                                <button className="w-full py-2.5 px-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm">
                                    Manage Members
                                </button>
                            </div>

                            <button className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
                                Open Chat Room
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamDetails;
