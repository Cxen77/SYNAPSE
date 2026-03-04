import React from 'react';

/**
 * VerifiedBadge — Verified Student indicator.
 * Renders ONLY when `verified === true` (strict equality).
 * "pending", "rejected", null, undefined, false → renders nothing.
 */
const VerifiedBadge = ({ verified }) => {
    if (verified !== true) return null;

    return (
        <span
            title="Verified Student"
            aria-label="Verified Student"
            className="inline-flex items-center justify-center w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"
            style={{ minWidth: '1rem' }}
        >
            <svg
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-2.5 h-2.5"
            >
                <path
                    d="M2 6L4.5 8.5L10 3.5"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </span>
    );
};

export default VerifiedBadge;
