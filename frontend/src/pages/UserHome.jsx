import React, { useRef, useEffect } from 'react';
import './UserHome.css';

const UserHome = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-6">
            Welcome back, Trader
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Manage your inventory, track sales, and generate invoices with ease.
            Your command center for global trade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Feature 1 */}
          <div className="group p-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Fast Invoicing</h3>
            <p className="text-gray-400">Create professional invoices in seconds. Auto-fill product details and calculate totals instantly.</p>
            <a href="/generate-invoice" className="inline-block mt-6 text-blue-400 hover:text-blue-300 font-medium">Get Started →</a>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Stock Alerts</h3>
            <p className="text-gray-400">Never run out of stock. Get real-time notifications when your inventory hits low levels.</p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3">Analytics</h3>
            <p className="text-gray-400">Visualize your sales data. Track performance and make data-driven decisions.</p>
          </div>
        </div>

        <div className="text-center">
          <a href="/generate-invoice" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-full shadow-lg shadow-blue-600/20 transform transition-all hover:scale-105">
            Create New Invoice
          </a>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
