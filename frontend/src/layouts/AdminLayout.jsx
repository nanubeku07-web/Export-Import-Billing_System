import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AdminLayout = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('profile') || '{}');

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Header user={user} />

            <main className="pt-20 min-h-screen transition-all duration-300">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
