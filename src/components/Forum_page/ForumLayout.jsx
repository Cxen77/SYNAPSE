import React from 'react';
import { Outlet } from 'react-router-dom';

const ForumLayout = () => {
    return (
        <div className="min-h-screen bg-gray-100 pb-10">
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <Outlet />
            </div>
        </div>
    );
};

export default ForumLayout;
