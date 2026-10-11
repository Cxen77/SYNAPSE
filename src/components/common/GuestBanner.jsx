import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';

export default function GuestBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside 
      aria-label="Join Synapse banner"
      className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-2xl border-t border-blue-400/30 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 relative">
        {/* Left text */}
        <div className="flex items-center gap-3 text-center sm:text-left pr-6 sm:pr-0">
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-white/10 items-center justify-center flex-shrink-0 text-yellow-300">
            <Sparkles size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm md:text-base leading-tight">
              Don’t miss what’s happening
            </h4>
            <p className="text-xs text-blue-100 mt-0.5 max-w-xl">
              People on Synapse are the first to know. Sign in or create an account to join projects and teams.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center">
          <Link
            to="/login"
            className="flex-1 sm:flex-initial text-center px-4 py-2 text-xs md:text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl transition duration-200"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="flex-1 sm:flex-initial text-center px-5 py-2 text-xs md:text-sm font-bold text-blue-600 bg-white hover:bg-gray-100 rounded-xl shadow-md transition duration-200"
          >
            Sign Up
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition sm:ml-1 absolute right-3 top-3 sm:static"
            title="Dismiss banner"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
