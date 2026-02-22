// src/components/Header.js

export default function Header({ user, onSignOut }) {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-40 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-3">
                    <img
                        src="/images/logo.PNG"
                        alt="DompetHub Logo"
                        className="h-16 w-auto object-contain"
                    />
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* FIX: Hide welcome text on extra-small screens */}
                        <span className="text-gray-600 hidden sm:block">
                            Welcome, {user.name || user.username}
                        </span>
                        <button
                            onClick={onSignOut}
                            className="bg-red-600 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-red-700 text-sm font-medium transition-colors shadow-sm"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
