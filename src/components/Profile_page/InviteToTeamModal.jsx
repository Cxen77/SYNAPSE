import React, { useState, useEffect } from 'react';
import { FaTimes, FaUsers, FaCheck } from 'react-icons/fa';
import api from '../../api/axios';

const InviteToTeamModal = ({ isOpen, onClose, userToInvite }) => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviting, setInviting] = useState(null); // Team ID being invited to
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchMyTeams();
        }
    }, [isOpen]);

    const fetchMyTeams = async () => {
        setLoading(true);
        try {
            // Get current user to check admin status
            const meRes = await api.get('/users/profile');
            setCurrentUser(meRes.data);

            const { data } = await api.get('/teams');
            // Filter teams where I am an admin
            const adminTeams = data.filter(team =>
                team.admins.some(admin =>
                    (typeof admin === 'string' ? admin : admin._id) === meRes.data._id
                )
            );
            setTeams(adminTeams);
        } catch (err) {
            console.error("Failed to fetch teams", err);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (teamId) => {
        setInviting(teamId);
        try {
            await api.put(`/teams/${teamId}/invite`, { userId: userToInvite._id });
            // Show success state briefly
            setTimeout(() => {
                setInviting(null);
                // Optional: Close modal or show persistent success
            }, 1000);
            alert(`Invited ${userToInvite.name} successfully!`);
        } catch (err) {
            console.error("Failed to invite user", err);
            alert(err.response?.data?.message || "Failed to invite user");
            setInviting(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Invite to Team</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar">
                    <p className="text-gray-600 mb-4">
                        Select a team to invite <span className="font-bold text-gray-900">{userToInvite?.name}</span> to:
                    </p>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading your teams...</div>
                    ) : teams.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                            <p>You don't have any teams to invite to.</p>
                            <p className="text-sm mt-1">Create a team first!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {teams.map(team => (
                                <div key={team._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <FaUsers />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{team.name}</h4>
                                            <p className="text-xs text-gray-500">{team.members.length} members</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleInvite(team._id)}
                                        disabled={inviting === team._id}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition ${inviting === team._id
                                                ? "bg-green-100 text-green-700"
                                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                            }`}
                                    >
                                        {inviting === team._id ? (
                                            <span className="flex items-center gap-2"><FaCheck /> Sent</span>
                                        ) : "Invite"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InviteToTeamModal;
