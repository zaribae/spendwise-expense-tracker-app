// src/components/Logo.js
import React from 'react';

export default function Logo({ className = 'h-10 w-auto' }) {
    return (
        <div className="flex items-center space-x-3">
            <svg
                className={className}
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M6 14H42V38C42 39.1046 41.1046 40 40 40H8C6.89543 40 6 39.1046 6 38V14Z" className="fill-blue-100 stroke-blue-500" strokeWidth="4" />
                <path d="M12 14V10C12 8.89543 12.8954 8 14 8H34C35.1046 8 36 8.89543 36 10V14" className="stroke-blue-500" strokeWidth="4" />
                <rect x="12" y="18" width="12" height="8" rx="2" className="fill-emerald-400" />
            </svg>
            <span className="text-2xl font-bold text-slate-800">DompetHub</span>
        </div>
    );
}
