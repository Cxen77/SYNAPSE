import React, { useState } from 'react';
import { HiX, HiUserGroup, HiCheck } from 'react-icons/hi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CreateForumModal = ({ isOpen, onClose, onCreated }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        topics: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/forums', {
                ...formData,
                topics: formData.topics.split(',').map(t => t.trim())
            });
            toast.success('Community created successfully!');
            onCreated(data);
            onClose();
            setFormData({ name: '', description: '', topics: '' });
        } catch (error) {
            console.error("Failed to create forum", error);
            toast.error(error.response?.data?.message || 'Failed to create community');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                        <div className="bg-blue-100 p-1.5 rounded-lg">
                            <HiUserGroup className="text-blue-600 w-5 h-5" />
                        </div>
                        Create a Community
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600">
                        <HiX className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-3 text-gray-400 font-bold text-sm group-focus-within:text-blue-500 transition">r/</span>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition font-medium"
                                placeholder="community_name"
                                required
                                maxLength={21}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5 ml-1">Community names including capitalization cannot be changed.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition h-28 resize-none"
                            placeholder="What is this community about?"
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Topics <span className="font-normal text-gray-400">(comma separated)</span></label>
                        <input
                            type="text"
                            name="topics"
                            value={formData.topics}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                            placeholder="technology, art, science"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>Creating...</>
                            ) : (
                                <>
                                    <HiCheck className="w-5 h-5" />
                                    Create Community
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateForumModal;
