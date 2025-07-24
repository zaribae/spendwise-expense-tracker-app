// src/components/Header.js
import React from 'react';
import Logo from './Logo'; // Import the new Logo component

export default function Header({ user, onSignOut }) {
    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-3">
                    <Logo className="h-9 w-auto" />
                    <div className="flex items-center space-x-4">
                        {/* FIX: Display user's full name, with a fallback to their email */}
                        <span className="text-gray-600 hidden sm:block">
                            Welcome, {user.name || user.username}
                        </span>
                        <button
                            onClick={onSignOut}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm font-medium"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
