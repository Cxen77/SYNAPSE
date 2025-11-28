import React, { useState } from "react";
import { FaTimes, FaUsers, FaLock, FaGlobe } from "react-icons/fa";
import api from "../../api/axios";

export default function CreateTeamModal({ isOpen, onClose, onTeamCreated }) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "Development",
        visibility: "public"
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { data } = await api.post("/teams", formData);
            onTeamCreated(data);
            onClose();
            setFormData({
                name: "",
                description: "",
                category: "Development",
                visibility: "public"
            });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create team");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Create New Team</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Team Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                            placeholder="e.g. Mobile App Squad"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition resize-none"
                            placeholder="What is this team about?"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition bg-white"
                            >
                                <option value="Development">Development</option>
                                <option value="Design">Design</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Research">Research</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Visibility</label>
                            <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, visibility: "public" })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition ${formData.visibility === "public" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    <FaGlobe size={12} /> Public
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, visibility: "private" })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition ${formData.visibility === "private" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    <FaLock size={12} /> Private
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <FaUsers /> Create Team
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
