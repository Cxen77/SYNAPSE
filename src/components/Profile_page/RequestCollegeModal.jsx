
import React, { useState } from 'react';
import { FaTimes, FaCheck } from 'react-icons/fa';
import api from '../../api/axios';

const RequestCollegeModal = ({ onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/colleges/request', { name, city });
            onSuccess(data.college); // Should return the new college object
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request college');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <FaTimes />
                </button>

                <h3 className="text-xl font-bold mb-4">Add Missing College</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Can't find your college? Add it here. It will be immediately available for selection.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Gotham University"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                            type="text"
                            value={city}
                            onChange={e => setCity(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Gotham City"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            {loading ? 'Adding...' : 'Add College'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestCollegeModal;
