import React, { useState, useEffect } from 'react';
import { FaUserPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Avatar from '../common/Avatar';

const SuggestedConnections = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const { data } = await api.get('/users/recommended');
                setSuggestions(data);
            } catch (error) {
                console.error("Failed to fetch suggestions", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-4">People You Might Know</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-blue-600 rounded-full block"></span>
                    People You Might Know
                </h3>
            </div>

            <div className="p-4">
                <div className="space-y-4">
                    {suggestions.map((person) => (
                        <div key={person._id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Link to={`/profile/${person.username}`}>
                                    <Avatar
                                        src={person.profilePic}
                                        alt={person.name}
                                        size="custom"
                                        className="w-10 h-10 hover:opacity-90 transition"
                                    />
                                </Link>
                                <div>
                                    <Link to={`/profile/${person.username}`}>
                                        <h4 className="font-bold text-gray-900 text-sm hover:text-blue-600 transition">{person.name}</h4>
                                    </Link>
                                    <p className="text-xs text-gray-500">
                                        {person.skills && person.skills.length > 0 ? person.skills[0].name || person.skills[0] : 'Student'}
                                    </p>
                                    <p className="text-xs text-gray-400">Suggested for you</p>
                                </div>
                            </div>
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition">
                                <FaUserPlus className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {suggestions.length === 0 && (
                        <p className="text-sm text-gray-500 text-center">No suggestions available.</p>
                    )}
                </div>
                <button className="w-full mt-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    View All Suggestions
                </button>
            </div>
        </div>
    );
};

export default SuggestedConnections;
