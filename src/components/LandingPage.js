// src/components/LandingPage.js
import React from 'react';
import Footer from './Footer';
import Logo from './Logo';

// A reusable component for feature items
const Feature = ({ icon, title, children }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg">
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="mt-1 text-gray-600">{children}</p>
        </div>
    </div>
);

export default function LandingPage({ children }) {
    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <header className="py-6 bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Logo />
                </div>
            </header>
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        {/* Left Column: Feature Description */}
                        <div className="space-y-12">
                            <div>
                                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                                    Track your spending, the <span className="text-indigo-600">smart</span> way.
                                </h1>
                                <p className="mt-4 text-xl text-gray-600">
                                    SpendWise uses AI to make logging your expenses and income as simple as sending a message. Get clear insights into your financial life.
                                </p>
                            </div>
                            <div className="space-y-8">
                                <Feature
                                    icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                    }
                                    title="AI-Powered Entry"
                                >
                                    Just type "beli kopi 15k" or "gaji bulanan 5jt", and our AI will handle the rest. No more tedious forms.
                                </Feature>
                                <Feature
                                    icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                    }
                                    title="Visual Dashboards"
                                >
                                    Understand your spending habits with clear monthly and daily charts. See where your money is going at a glance.
                                </Feature>
                                <Feature
                                    icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    }
                                    title="Secure & Private"
                                >
                                    Your financial data is yours alone. With secure cloud storage and private accounts, your information is always safe.
                                </Feature>
                            </div>
                        </div>
                        {/* Right Column: Sign-in/Sign-up Card */}
                        <div>
                            {children}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
