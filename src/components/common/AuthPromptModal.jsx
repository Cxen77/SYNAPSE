import React from 'react';
import { Link } from 'react-router-dom';
import { X, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function AuthPromptModal({ isOpen, onClose, title, message, icon: Icon = Sparkles }) {
  const { googleLogin } = useAuth();

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      if (googleLogin) {
        await googleLogin();
        onClose();
      }
    } catch (err) {
      console.error("Google sign in error", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200 z-10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-sm">
            <Icon size={26} />
          </div>

          <h3 
            id="auth-modal-title"
            className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight"
          >
            {title || "Don't miss what's happening"}
          </h3>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
            {message || "People on Synapse are discovering events, joining teams, and sharing projects. Sign in to interact."}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          {/* Quick Google Sign In */}
          {googleLogin && (
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-750 transition active:scale-[0.99] shadow-sm"
            >
              <FaGoogle className="text-red-500" />
              <span>Continue with Google</span>
            </button>
          )}

          {/* Log In */}
          <Link
            to="/login"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition active:scale-[0.99]"
          >
            <LogIn size={16} />
            <span>Log In</span>
          </Link>

          {/* Sign Up */}
          <Link
            to="/signup"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-semibold transition active:scale-[0.99]"
          >
            <UserPlus size={16} />
            <span>Create Account</span>
          </Link>
        </div>

        {/* Footer Note */}
        <p className="mt-5 text-center text-xs text-gray-400 dark:text-gray-500">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
