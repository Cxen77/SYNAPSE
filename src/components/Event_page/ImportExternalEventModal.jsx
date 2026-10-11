import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  FiLink,
  FiLoader,
  FiExternalLink,
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiCheck,
  FiX,
  FiAward,
  FiArrowRight,
  FiAlertCircle
} from 'react-icons/fi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ImportExternalEventModal({ isOpen, onClose, onImported }) {
  const [url, setUrl] = useState('');
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [alreadyImported, setAlreadyImported] = useState(false);
  const [existingEvent, setExistingEvent] = useState(null);

  if (!isOpen) return null;

  const handleParse = async (e) => {
    e?.preventDefault();
    if (!url.trim()) {
      toast.error('Please paste an event link');
      return;
    }

    setParsing(true);
    setMetadata(null);
    setAlreadyImported(false);
    setExistingEvent(null);

    try {
      const res = await api.post('/events/parse-external-link', { url: url.trim() });
      if (res.data?.metadata) {
        setMetadata(res.data.metadata);
        if (res.data.alreadyImported) {
          setAlreadyImported(true);
          setExistingEvent(res.data.existingEvent);
          toast('This event is already listed on Synapse!', { icon: 'ℹ️' });
        } else {
          toast.success(`Event details fetched from ${res.data.metadata.platform || 'link'}!`);
        }
      }
    } catch (err) {
      console.error('Failed to parse event link', err);
      toast.error(err.response?.data?.message || 'Could not parse this link. You can still fill details manually.');
      // Provide basic editable template
      setMetadata({
        title: 'New External Hackathon',
        description: 'Compete in this external competition. Find your squad on Synapse!',
        platform: 'Unstop',
        externalUrl: url.trim(),
        category: 'Hackathon',
        location: 'Online',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maxTeamSize: 4,
        minTeamSize: 1,
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80'
      });
    } finally {
      setParsing(false);
    }
  };

  const handleFieldChange = (field, val) => {
    setMetadata(prev => prev ? { ...prev, [field]: val } : null);
  };

  const handleSubmit = async () => {
    if (!metadata || !metadata.title || !metadata.externalUrl) {
      toast.error('Event title and link are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/events/import-external', metadata);
      toast.success('Event added successfully! You can now find teammates.');
      if (onImported) onImported(res.data);
      onClose();
    } catch (err) {
      console.error('Failed to import external event', err);
      if (err.response?.status === 409 && err.response?.data?.event) {
        toast('This event was already added by someone else!', { icon: 'ℹ️' });
        if (onImported) onImported(err.response.data.event);
        onClose();
      } else {
        toast.error(err.response?.data?.message || 'Failed to list event');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <FiLink size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                Import External Event
              </h3>
              <p className="text-xs text-gray-400">
                Paste a link from Unstop, Devfolio, or Devpost to find teammates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Link Input Section */}
          <form onSubmit={handleParse} className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Event Page Link
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FiLink className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                <input
                  type="url"
                  placeholder="https://unstop.com/hackathons/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  disabled={parsing || submitting}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={parsing || !url.trim()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm transition flex items-center gap-2 shadow-sm shrink-0"
              >
                {parsing ? (
                  <>
                    <FiLoader className="animate-spin" size={16} />
                    <span>Fetching…</span>
                  </>
                ) : (
                  <>
                    <span>Fetch Details</span>
                    <FiArrowRight size={14} />
                  </>
                )}
              </button>
            </div>

            {/* Quick platform badges */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-gray-400">Supported:</span>
              {['Unstop', 'Devfolio', 'Devpost', 'HackerEarth', 'MLH'].map((p) => (
                <span
                  key={p}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium"
                >
                  {p}
                </span>
              ))}
            </div>
          </form>

          {/* Already Imported Warning */}
          {alreadyImported && existingEvent && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
              <FiAlertCircle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={18} />
              <div className="text-xs text-amber-800 dark:text-amber-300 flex-1">
                <p className="font-semibold mb-1">This event is already listed!</p>
                <p className="mb-2">Other users are already queueing for squad members on Synapse.</p>
                <button
                  type="button"
                  onClick={() => {
                    if (onImported) onImported(existingEvent);
                    onClose();
                  }}
                  className="font-bold underline text-amber-900 dark:text-amber-200 hover:opacity-80"
                >
                  View Event & Find Squad →
                </button>
              </div>
            </div>
          )}

          {/* Parsed Metadata Preview / Editor */}
          {metadata && !alreadyImported && (
            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <FiCheck size={14} /> Preview & Confirmation
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                  {metadata.platform}
                </span>
              </div>

              {/* Banner Image Preview */}
              {metadata.imageUrl && (
                <div className="relative h-36 w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                  <img
                    src={metadata.imageUrl}
                    alt={metadata.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                    <span className="text-white text-xs font-semibold truncate drop-shadow">
                      {metadata.title}
                    </span>
                  </div>
                </div>
              )}

              {/* Event Title */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={metadata.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={metadata.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Grid: Date, Location, Team Size */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <FiCalendar size={12} /> Date
                  </label>
                  <input
                    type="date"
                    value={
                      metadata.date
                        ? new Date(metadata.date).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) => handleFieldChange('date', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <FiMapPin size={12} /> Location / Mode
                  </label>
                  <input
                    type="text"
                    value={metadata.location || 'Online'}
                    onChange={(e) => handleFieldChange('location', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs outline-none"
                    placeholder="Online"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <FiUsers size={12} /> Max Squad Size
                  </label>
                  <select
                    value={metadata.maxTeamSize || 4}
                    onChange={(e) => handleFieldChange('maxTeamSize', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs outline-none cursor-pointer"
                  >
                    {[2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>
                        {num} Members
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {submitting ? (
                    <>
                      <FiLoader className="animate-spin" size={16} />
                      <span>Listing Event…</span>
                    </>
                  ) : (
                    <>
                      <FiAward size={16} />
                      <span>List Event & Enable Teaming</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ImportExternalEventModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onImported: PropTypes.func
};
