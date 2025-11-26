import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const UserLayout = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('profile') || '{}');
    const isAdmin = user?.is_staff;

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            {!isAdmin && <Sidebar role="user" />}
            <Header user={user} />

            <main className={`${isAdmin ? '' : 'pl-64'} pt-20 min-h-screen transition-all duration-300`}>
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default UserLayout;
