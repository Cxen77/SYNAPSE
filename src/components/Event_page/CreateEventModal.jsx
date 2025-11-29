import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaTrophy, FaImage } from 'react-icons/fa';
import api from '../../api/axios';

const CreateEventModal = ({ isOpen, onClose, onEventCreated, eventToEdit = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        category: 'Hackathon',
        prize: '',
        imageUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (eventToEdit) {
            setFormData({
                title: eventToEdit.title || '',
                description: eventToEdit.description || '',
                date: eventToEdit.date ? new Date(eventToEdit.date).toISOString().split('T')[0] : '',
                location: eventToEdit.location || '',
                category: eventToEdit.category || 'Hackathon',
                prize: eventToEdit.prize || '',
                imageUrl: eventToEdit.imageUrl || ''
            });
        } else {
            setFormData({
                title: '',
                description: '',
                date: '',
                location: '',
                category: 'Hackathon',
                prize: '',
                imageUrl: ''
            });
        }
    }, [eventToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let data;
            if (eventToEdit) {
                const res = await api.put(`/events/${eventToEdit._id}`, formData);
                data = res.data;
            } else {
                const res = await api.post('/events', formData);
                data = res.data;
            }
            onEventCreated(data, !!eventToEdit); // Pass true if it was an edit
            onClose();
        } catch (err) {
            console.error("Failed to save event", err);
            setError(err.response?.data?.message || "Failed to save event");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">{eventToEdit ? 'Edit Event' : 'Create New Event'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="e.g., AI Hackathon 2025"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="3"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                            placeholder="What is this event about?"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <div className="relative">
                                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <div className="relative">
                                <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="e.g., Online / NYC"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                            >
                                <option value="Hackathon">Hackathon</option>
                                <option value="Workshop">Workshop</option>
                                <option value="Seminar">Seminar</option>
                                <option value="Tournament">Tournament</option>
                                <option value="Meetup">Meetup</option>
                                <option value="Project">Project</option>
                                <option value="Game">Game</option>
                                <option value="Sport">Sport</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prize Pool (Optional)</label>
                            <div className="relative">
                                <FaTrophy className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="prize"
                                    value={formData.prize}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="e.g., $10,000"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                        <div className="relative">
                            <FaImage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="url"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-70 flex items-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                eventToEdit ? 'Update Event' : 'Create Event'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEventModal;
