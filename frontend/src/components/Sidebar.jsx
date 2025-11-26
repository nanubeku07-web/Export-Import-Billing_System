import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    CreditCard,
    FileText,
    Ship,
    Package,
    Users,
    DollarSign,
    BarChart3,
    Settings,
    LogOut,
    Globe
} from 'lucide-react';

const Sidebar = ({ role = 'admin' }) => {
    const location = useLocation();

    const adminLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Invoices', path: '/invoices', icon: FileText },
        { name: 'Orders', path: '/orders', icon: Ship },
        { name: 'Products', path: '/products', icon: Package },
        { name: 'Inventory', path: '/inventory', icon: DollarSign },
        { name: 'Reports', path: '/reports', icon: BarChart3 },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    const userLinks = [
        { name: 'Dashboard', path: '/home', icon: LayoutDashboard },
        { name: 'Invoice', path: '/generate-invoice', icon: FileText },
        { name: 'Products', path: '/user-products', icon: Package },
    ];

    const links = role === 'admin' ? adminLinks : userLinks;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem('profile');
        window.dispatchEvent(new Event("authChange"));
        window.location.href = "/login";
    };

    return (
        <div className="h-screen w-64 flex flex-col fixed left-0 top-0 z-20 transition-all duration-300" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))', borderRight: '1px solid rgba(148, 163, 184, 0.1)', backdropFilter: 'blur(10px)' }}>
            {/* Logo */}
            <div className="h-20 flex items-center px-8" style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <Globe className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold" style={{ color: '#f1f5f9' }}>TradeTrack</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;

                    return (
                        <Link
                            key={link.name}
                            to={link.path}
                            className="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                            style={{
                                background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                color: isActive ? '#6366f1' : '#94a3b8',
                                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                                paddingLeft: isActive ? '13px' : '16px'
                            }}
                        >
                            <Icon className="w-5 h-5 mr-3" style={{ color: isActive ? '#6366f1' : '#64748b' }} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile / Logout */}
            <div className="p-4" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                    style={{ color: '#ef4444' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
