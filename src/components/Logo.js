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
                <path
                    d="M4,10C4,8.89543,4.89543,8,6,8H42C43.1046,8,44,8.89543,44,10V38C44,39.1046,43.1046,40,42,40H6C4.89543,40,4,39.1046,4,38V10Z"
                    className="stroke-blue-500"
                    strokeWidth="4"
                />
                <path
                    d="M4,14H44"
                    className="stroke-blue-500"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M36,27C36,30.3137,33.3137,33,30,33C26.6863,33,24,30.3137,24,27C24,23.6863,26.6863,21,30,21C33.3137,21,36,23.6863,36,27Z"
                    className="fill-emerald-400 stroke-blue-500"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <span className="text-2xl font-bold text-slate-800">SpendWise</span>
        </div>
    );
}
