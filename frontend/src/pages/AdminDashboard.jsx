import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../api';
import AdminLayout from '../layouts/AdminLayout';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [report, setReport] = useState(null);
  const [previousReport, setPreviousReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 29); return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      setLoading(true);
      const params = `?start_date=${startDate}&end_date=${endDate}`;
      const res = await api.apiFetch(`/api/reports/sales/${params}`);
      if (mounted && res.ok) setReport(res.data);

      const s = new Date(startDate);
      const e = new Date(endDate);
      const periodDays = Math.round((e - s) / (1000*60*60*24)) + 1;
      const prevEnd = new Date(s); prevEnd.setDate(prevEnd.getDate() - 1);
      const prevStart = new Date(prevEnd); prevStart.setDate(prevEnd.getDate() - (periodDays - 1));
      const prevParams = `?start_date=${prevStart.toISOString().slice(0,10)}&end_date=${prevEnd.toISOString().slice(0,10)}`;
      const pres = await api.apiFetch(`/api/reports/sales/${prevParams}`);
      if (mounted && pres.ok) setPreviousReport(pres.data);
      setLoading(false);
    };
    fetchAll();
    return () => { mounted = false; };
  }, [startDate, endDate]);

  const calcDelta = (current = 0, previous = 0) => {
    if (!previous || previous === 0) return null;
    const v = ((current - previous) / previous) * 100;
    return Math.round(v * 10) / 10;
  };

  const monthlyData = (report?.monthly_sales_last_12 || []).map(m => ({
    month: new Date(m.year, m.month - 1).toLocaleString(undefined, { month: "short" }),
    revenue: m.sales
  }));

  const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1>Dashboard</h1>
            <p>Monitor your business metrics and performance</p>
          </div>
          <div className="date-range-controls">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <span>to</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading analytics...</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-top">
                  <div>
                    <div className="kpi-label">Total Sales</div>
                    <div className="kpi-value">₹{(report?.total_sales || 0).toLocaleString()}</div>
                  </div>
                  <div className="kpi-icon">📊</div>
                </div>
                <div className={`kpi-delta ${calcDelta(report?.total_sales, previousReport?.total_sales) >= 0 ? 'positive' : 'negative'}`}>
                  {calcDelta(report?.total_sales, previousReport?.total_sales) || 0}% vs last period
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <div>
                    <div className="kpi-label">Invoices Created</div>
                    <div className="kpi-value">{report?.invoice_count || 0}</div>
                  </div>
                  <div className="kpi-icon">📄</div>
                </div>
                <div className="kpi-delta info">{(report?.sales_by_user || []).length || 0} users</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <div>
                    <div className="kpi-label">Top Product</div>
                    <div className="kpi-value">{(report?.top_products && report.top_products[0]) ? report.top_products[0].product_name.substring(0, 15) : '—'}</div>
                  </div>
                  <div className="kpi-icon">📦</div>
                </div>
                <div className="kpi-delta info">₹{(report?.top_products && report.top_products[0]) ? Number(report.top_products[0].total_sales).toLocaleString() : '0'}</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <div>
                    <div className="kpi-label">Active Users</div>
                    <div className="kpi-value">{(report?.sales_by_user || []).length || 0}</div>
                  </div>
                  <div className="kpi-icon">👥</div>
                </div>
                <div className="kpi-delta info">Period: {startDate} to {endDate}</div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
              <div className="chart-card">
                <h3>Monthly Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569", borderRadius: "0.5rem" }} />
                    <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>Top Products</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={(report?.top_products || []).map(p => ({ product_name: p.product_name, total_sales: p.total_sales }))} dataKey="total_sales" nameKey="product_name" cx="50%" cy="50%" outerRadius={90} label>
                      {(report?.top_products || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tables Section */}
            <div className="tables-section">
              <div className="table-card">
                <h3>Top Users (Sellers)</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Invoices</th>
                      <th>Total Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report?.sales_by_user || []).slice(0, 5).map(u => (
                      <tr key={u.user_id}>
                        <td className="user-col">{u.username || '—'}</td>
                        <td>{u.invoice_count}</td>
                        <td className="amount-col">₹{Number(u.total_sales).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="table-card">
                <h3>Quick Actions</h3>
                <div className="actions-list">
                  <button className="action-item" onClick={() => window.location.href = '/generate-invoice'}>
                    <span className="action-icon">➕</span>
                    <span className="action-text">Create Invoice</span>
                  </button>
                  <button className="action-item" onClick={() => window.location.href = '/add-product'}>
                    <span className="action-icon">📦</span>
                    <span className="action-text">Add Product</span>
                  </button>
                  <button className="action-item" onClick={() => window.location.href = '/products'}>
                    <span className="action-icon">📊</span>
                    <span className="action-text">View Inventory</span>
                  </button>
                  <button className="action-item" onClick={() => window.location.href = '/reports'}>
                    <span className="action-icon">📈</span>
                    <span className="action-text">View Reports</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

