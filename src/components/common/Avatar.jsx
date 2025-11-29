import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa';

const Avatar = ({ src, alt, size = "md", className = "" }) => {
    const [error, setError] = useState(false);

    // Size mapping
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-24 h-24",
        xl: "w-40 h-40",
        custom: "" // Use className for custom sizes
    };

    const currentSizeClass = sizeClasses[size] || sizeClasses.md;

    if (!src || error) {
        return (
            <div
                className={`${currentSizeClass} ${className} bg-gray-200 flex items-center justify-center text-gray-400 rounded-full overflow-hidden`}
                title={alt}
            >
                <FaUser className={size === 'sm' ? 'w-4 h-4' : size === 'xl' ? 'w-16 h-16' : 'w-6 h-6'} />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={`${currentSizeClass} ${className} object-cover rounded-full`}
            onError={() => setError(true)}
        />
    );
};

export default Avatar;
