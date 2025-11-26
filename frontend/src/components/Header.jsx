import React from 'react';
import { Bell, Search, ChevronDown, User } from 'lucide-react';

const Header = ({ user }) => {
    return (
        <header className="h-20 fixed top-0 right-0 left-64 z-10 px-8 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
            {/* Search Bar */}
            <div className="flex items-center w-96">
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 text-sm focus:outline-none transition-all rounded-xl"
                        style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(148, 163, 184, 0.2)', color: '#f1f5f9' }}
                        onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)'; e.target.style.boxShadow = 'none'; }}
                        placeholder="Search orders, clients, invoices..."
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-6">
                {/* Notifications */}
                <button className="relative p-2 transition-colors" style={{ color: '#94a3b8' }} onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2" style={{ borderColor: '#0f172a' }}></span>
                </button>

                {/* Profile Dropdown */}
                <div className="flex items-center space-x-3 pl-6 cursor-pointer" style={{ borderLeft: '1px solid rgba(148, 163, 184, 0.1)' }}>
                    <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        {user?.username ? user.username.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-semibold" style={{ color: '#f1f5f9' }}>{user?.username || 'User'}</p>
                        <p className="text-xs" style={{ color: '#94a3b8' }}>{user?.is_staff ? 'Administrator' : 'Client'}</p>
                    </div>
                    <ChevronDown className="w-4 h-4" style={{ color: '#94a3b8' }} />
                </div>
            </div>
        </header>
    );
};

export default Header;
