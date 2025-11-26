import React, { useEffect, useState } from "react";
import api from '../api';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";
import "./Dashboard.css";

const salesData = [];
const weeklyData = [];

const recentProducts = [
  { id: 101, name: "Neo Monitor X1", stock: 8, price: 12999 },
  { id: 102, name: "Ultra Keyboard", stock: 21, price: 1999 },
  { id: 103, name: "Flux Router", stock: 4, price: 6999 },
  { id: 104, name: "PixelPhone Z", stock: 12, price: 54999 },
];

const Dashboard = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError(null);
      const res = await api.apiFetch('/api/reports/sales/');
      if (!mounted) return;
      if (res.ok) setReport(res.data);
      else setError(res.data || `Status ${res.status}`);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  // Decide whether user is admin-like (staff or has can_view_reports) or a normal user
  const profileRaw = localStorage.getItem('profile');
  let isAdminLike = false;
  try {
    const p = profileRaw ? JSON.parse(profileRaw) : null;
    isAdminLike = (p && p.can_view_reports) || (p && p.is_staff);
  } catch (e) { isAdminLike = false; }

  if (!isAdminLike) {
    // Simple user dashboard / homepage substitute
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to your dashboard</h2>
            <p className="text-gray-600 mb-8">Quick actions to help you generate invoices and track your work.</p>

            <div className="flex gap-4">
              <a href="/generate-invoice" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/20">
                Generate Invoice
              </a>
              <a href="/home" className="px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition-colors">
                Home
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Your Recent Activity</h3>
            {loading && <div className="text-gray-500 animate-pulse">Loading analytics...</div>}
            {error && <div className="text-red-500 bg-red-50 p-4 rounded-lg">Error loading analytics: {String(error)}</div>}
            {!loading && report && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-600 font-medium uppercase tracking-wider mb-1">Total Invoices</p>
                  <p className="text-3xl font-bold text-gray-900">{report.invoice_count}</p>
                </div>
                <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-sm text-green-600 font-medium uppercase tracking-wider mb-1">Total Sales</p>
                  <p className="text-3xl font-bold text-gray-900">₹{Number(report.total_sales).toLocaleString()}</p>
                </div>
              </div>
            )}
            {!loading && !report && (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p>No recent activity found.</p>
                <p className="text-sm mt-2">Use "Generate Invoice" to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Admin analytics (original dashboard view)
  // derive chart data from report when available
  const dailySeven = (report && report.daily_sales_last_30) ? report.daily_sales_last_30.slice(-7).map(d => ({ day: new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }), sales: d.sales })) : [];
  const monthly12 = (report && report.monthly_sales_last_12) ? report.monthly_sales_last_12.map(m => ({ name: new Date(m.year, m.month - 1, 1).toLocaleString(undefined, { month: 'short', year: 'numeric' }), revenue: m.sales })) : [];

  const totalSalesDisplay = report ? Number(report.total_sales).toLocaleString() : '—';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">TT</div>
            <span className="text-xl font-bold text-gray-900">TradeTrack</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-medium transition-colors">
            <span>Overview</span>
          </a>
          <a href="/products" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
            <span>Products</span>
          </a>
          <a href="/invoices" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
            <span>Invoices</span>
          </a>
          <a href="/reports" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
            <span>Reports</span>
          </a>
          <a href="/settings" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
            <span>Settings</span>
          </a>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => window.location.href = '/generate-invoice'}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            New Invoice
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-500 mt-1">Real-time updates & insights</p>
          </div>

          <div className="flex gap-3">
            <button
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors shadow-sm"
              onClick={async () => {
                try {
                  const csvRes = await api.apiFetch('/api/reports/sales/csv/');
                  if (csvRes.ok && csvRes.data && typeof csvRes.data === 'string') {
                    const blob = new Blob([csvRes.data], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = 'sales_by_product.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
                    return;
                  }
                  const res = await api.apiFetch('/api/reports/sales/');
                  if (!res.ok) { alert('Failed to fetch reports: ' + (res.data || res.status)); return; }
                  const report = res.data;
                  const rows = [['product_id', 'product_name', 'total_quantity', 'total_sales']];
                  (report.sales_by_product || []).forEach(p => rows.push([p.product_id, p.product_name, p.total_quantity, p.total_sales]));
                  const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = 'sales_by_product.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
                } catch (e) { alert('Export failed: ' + e.message); }
              }}
            >
              Export CSV
            </button>
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              onClick={() => window.location.href = '/generate-invoice'}
            >
              New Invoice
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">1,240</h3>
              </div>
              <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">📦</span>
            </div>
            <div className="text-xs text-gray-500">Stock tracked • realtime</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Sales</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">₹ {totalSalesDisplay}</h3>
              </div>
              <span className="p-2 bg-green-50 text-green-600 rounded-lg">💰</span>
            </div>
            <div className="text-xs text-gray-500">Last 30 days</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Today Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  ₹ {(dailySeven && dailySeven.length > 0) ? Number(dailySeven[dailySeven.length - 1].sales).toLocaleString() : '—'}
                </h3>
              </div>
              <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">📈</span>
            </div>
            <div className="text-xs text-gray-500">Updated 10m ago</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">5 items</h3>
              </div>
              <span className="p-2 bg-red-50 text-red-600 rounded-lg">⚠️</span>
            </div>
            <div className="text-xs text-red-500 font-medium">Needs restock</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Daily Sales Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailySeven} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                    itemStyle={{ color: "#111827" }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Revenue</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly12} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                    cursor={{ fill: '#F3F4F6' }}
                  />
                  <Bar dataKey="revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Products</h3>
            <div className="flex gap-3">
              <input
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search product..."
              />
              <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                View all
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  {(() => {
                    const profileRaw = localStorage.getItem('profile');
                    let showAction = false;
                    try {
                      const p = profileRaw ? JSON.parse(profileRaw) : null;
                      showAction = (p && p.can_view_reports) || (p && p.is_staff);
                    } catch (e) { showAction = false; }
                    return showAction ? <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th> : null;
                  })()}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">#{p.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">₹{p.price.toLocaleString()}</td>
                    {(() => {
                      const profileRaw = localStorage.getItem('profile');
                      let showAction = false;
                      try {
                        const p = profileRaw ? JSON.parse(profileRaw) : null;
                        showAction = (p && p.can_view_reports) || (p && p.is_staff);
                      } catch (e) { showAction = false; }
                      if (!showAction) return null;
                      return (
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-3">
                            <button
                              className="text-blue-600 hover:text-blue-800 font-medium"
                              onClick={() => { window.location.href = `/add-product?id=${p.id}`; }}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800 font-medium"
                              onClick={() => {
                                if (!window.confirm('Delete this product?')) return;
                                window.location.href = '/products';
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      );
                    })()}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
