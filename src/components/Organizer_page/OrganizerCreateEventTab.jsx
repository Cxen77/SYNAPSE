import React, { useState } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaTrophy, FaImage, FaUsers, FaChevronDown, FaTag } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ["Hackathon", "Workshop", "Seminar", "Tournament", "Meetup", "Project"];

const CustomDropdown = ({ options, value, onChange, icon: Icon, placeholder = "-- Select --" }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white outline-none transition group hover:border-blue-500/30"
            >
                <div className="flex items-center gap-2 text-left truncate">
                    {Icon && <Icon className="text-blue-500 shrink-0" size={14} />}
                    <span className={`truncate ${value ? "font-semibold" : "text-gray-400"}`}>
                        {value || placeholder}
                    </span>
                </div>
                <FaChevronDown className={`transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} size={14} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-20 w-full mt-1 py-1 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                        >
                            {options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-between ${value === opt ? 'text-blue-500 bg-blue-500/5' : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <span className="truncate">{opt}</span>
                                    {value === opt && <CheckCircle2 size={12} className="text-blue-500 shrink-0" />}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function OrganizerCreateEventTab() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        category: 'Hackathon',
        prize: '',
        imageUrl: '',
        maxTeamSize: 4,
        isMultiCollege: true,
        allowTeamRegistration: false
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/events', formData);
            toast.success("Event created successfully!");
            setFormData({
                title: '',
                description: '',
                date: '',
                location: '',
                category: 'Hackathon',
                prize: '',
                imageUrl: '',
                maxTeamSize: 4,
                isMultiCollege: true,
                allowTeamRegistration: false
            });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create event");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Event</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Event Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required
                        className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="e.g., AI Hackathon 2025" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"
                        className="w-full px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                        placeholder="What is this event about?" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Date</label>
                        <div className="relative">
                            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required
                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white [color-scheme:dark] focus:ring-2 focus:ring-blue-500 outline-none transition" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Location</label>
                        <div className="relative">
                            <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" name="location" value={formData.location} onChange={handleChange} required
                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                                placeholder="e.g., Online / Auditorium" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Category</label>
                        <CustomDropdown
                            options={CATEGORIES}
                            value={formData.category}
                            onChange={val => setFormData(prev => ({ ...prev, category: val }))}
                            icon={FaTag}
                            placeholder="Select Category"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Prize Pool (Optional)</label>
                        <div className="relative">
                            <FaTrophy className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" name="prize" value={formData.prize} onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                                placeholder="e.g., $10,000" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Cover Image URL</label>
                    <div className="relative">
                        <FaImage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="https://example.com/image.jpg" />
                    </div>
                </div>

                {/* Organizer Specific Fields */}
                <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-xl space-y-4">
                    <h3 className="font-semibold text-blue-400">Event Configuration</h3>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" name="isMultiCollege" checked={formData.isMultiCollege} onChange={handleChange}
                            className="w-5 h-5 rounded border-gray-200 text-blue-500 focus:ring-blue-500 bg-gray-100" />
                        <span className="text-sm text-gray-600">Allow Cross-College Participation (Global Join)</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" name="allowTeamRegistration" checked={formData.allowTeamRegistration} onChange={handleChange}
                            className="w-5 h-5 rounded border-gray-200 text-blue-500 focus:ring-blue-500 bg-gray-100" />
                        <span className="text-sm text-gray-600">Enable Team Registration</span>
                    </label>

                    {formData.allowTeamRegistration && (
                        <div className="pt-2">
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Max Team Size</label>
                            <div className="relative md:w-1/2">
                                <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="number" name="maxTeamSize" value={formData.maxTeamSize} onChange={handleChange} min="1" max="15" required
                                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={loading}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-70">
                        {loading ? 'Creating...' : 'Create Event'}
                    </button>
                </div>
            </form>
        </div>
    );
}
