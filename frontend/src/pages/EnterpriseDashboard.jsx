import React, { useEffect, useState } from "react";
import api from "../api";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import "./EnterpriseDashboard.css";

const EnterpriseDashboard = () => {
  const [report, setReport] = useState(null);
  const [previousReport, setPreviousReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 29); return d.toISOString().slice(0,10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0,10));
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      setLoading(true);
      // main report for selected window
      const params = `?start_date=${startDate}&end_date=${endDate}`;
      const res = await api.apiFetch(`/api/reports/sales/${params}`);
      if (mounted && res.ok) setReport(res.data);

      // compute previous period (same length immediately before startDate)
      const s = new Date(startDate);
      const e = new Date(endDate);
      const periodDays = Math.round((e - s) / (1000*60*60*24)) + 1;
      const prevEnd = new Date(s); prevEnd.setDate(prevEnd.getDate() - 1);
      const prevStart = new Date(prevEnd); prevStart.setDate(prevEnd.getDate() - (periodDays - 1));
      const prevParams = `?start_date=${prevStart.toISOString().slice(0,10)}&end_date=${prevEnd.toISOString().slice(0,10)}`;
      const pres = await api.apiFetch(`/api/reports/sales/${prevParams}`);
      if (mounted && pres.ok) setPreviousReport(pres.data);

      // recent invoices (no date filter) - backend returns up to 200
      const inv = await api.apiFetch('/api/reports/invoices/');
      if (mounted && inv.ok) setInvoices(inv.data.invoices.slice(0,10));

      setLoading(false);
    };
    fetchAll();
    return () => { mounted = false; };
  }, [startDate, endDate]);

  const downloadCSV = async () => {
    try {
      const res = await fetch((process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000') + '/api/reports/sales/csv/', {
        headers: { 'Authorization': api.getToken() ? `Token ${api.getToken()}` : '' }
      });
      if (!res.ok) { alert('Failed to export CSV: ' + res.status); return; }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sales_by_product.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) { alert('Export error: '+err.message); }
  };

  const dailyData = (report?.daily_sales_last_30 || []).slice(-7).map(d => ({
    date: new Date(d.date).toLocaleDateString(undefined, { weekday: "short" }),
    sales: d.sales
  }));

  const monthlyData = (report?.monthly_sales_last_12 || []).map(m => ({
    month: new Date(m.year, m.month - 1).toLocaleString(undefined, { month: "short" }),
    revenue: m.sales
  }));

  const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b"];

  const calcDelta = (current = 0, previous = 0) => {
    if (!previous || previous === 0) return null;
    const v = ((current - previous) / previous) * 100;
    return Math.round(v * 10) / 10; // one decimal
  };

  const downloadCSVWithRange = async (s, e) => {
    try {
      const base = (process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000') + '/api/reports/sales/csv/';
      const url = `${base}?start_date=${s}&end_date=${e}`;
      const res = await fetch(url, { headers: { 'Authorization': api.getToken() ? `Token ${api.getToken()}` : '' } });
      if (!res.ok) { alert('Failed to export CSV: ' + res.status); return; }
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `sales_${s}_to_${e}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) { alert('Export error: '+err.message); }
  };

  return (
    <div className="enterprise-dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">📊</span>
          <span className="brand-text">TradeTrack</span>
        </div>

        <nav className="sidebar-nav">
          <a href="/dashboard" className="nav-item active">
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Dashboard</span>
          </a>
          <a href="/invoices" className="nav-item">
            <span className="nav-icon">📄</span>
            <span className="nav-label">Invoices</span>
          </a>
          <a href="/products" className="nav-item">
            <span className="nav-icon">📦</span>
            <span className="nav-label">Inventory</span>
          </a>
          <a href="/reports" className="nav-item">
            <span className="nav-icon">📊</span>
            <span className="nav-label">Reports</span>
          </a>
          <a href="/clients" className="nav-item">
            <span className="nav-icon">👥</span>
            <span className="nav-label">Clients</span>
          </a>
          <a href="/settings" className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Settings</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-primary btn-sm" onClick={() => window.location.href = "/generate-invoice"}>
            ➕ New Invoice
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p className="text-secondary">Welcome back! Here's your business overview.</p>
          </div>

          <div className="header-actions">
            <button className="icon-btn" title="Notifications">🔔</button>
            <div className="profile-dropdown">
              <button className="avatar">A</button>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="dashboard-content">
            {/* KPI Cards */}
            <section className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-icon">📥</span>
                  <span className="kpi-title">Total Imports</span>
                </div>
                <div className="kpi-value">₹{(report?.total_sales || 0).toLocaleString()}</div>
                <div className="kpi-change positive">↑ 12% from last month</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-icon">📤</span>
                  <span className="kpi-title">Total Exports</span>
                </div>
                <div className="kpi-value">₹{(report?.total_sales || 0).toLocaleString()}</div>
                <div className="kpi-change positive">↑ 8% from last month</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-icon">💰</span>
                  <span className="kpi-title">Monthly Revenue</span>
                </div>
                <div className="kpi-value">₹{(report?.total_sales || 0).toLocaleString()}</div>
                <div className="kpi-change positive">↑ 5% from last month</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-icon">⏳</span>
                  <span className="kpi-title">Pending Payments</span>
                </div>
                <div className="kpi-value">₹{(report?.total_sales || 0).toLocaleString()}</div>
                <div className="kpi-change warning">↑ 3 invoices pending</div>
              </div>
            </section>

            {/* Charts */}
            <section className="charts-grid">
              <div className="chart-card">
                <h3 className="chart-title">Revenue Trend (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569", borderRadius: "0.5rem" }} />
                    <Line type="monotone" dataKey="sales" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3 className="chart-title">Monthly Revenue</h3>
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

              {/* Top Products Pie */}
              <div className="chart-card">
                <h3 className="chart-title">Top Products (by Sales)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={(report?.top_products || []).map(p=>({product_name:p.product_name, total_sales:p.total_sales}))} dataKey="total_sales" nameKey="product_name" cx="50%" cy="50%" outerRadius={90} label>
                      {(report?.top_products || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="actions-grid">
                <button className="action-btn" onClick={() => window.location.href = '/generate-invoice'}>
                  <span className="action-icon">📄</span>
                  <span>Create Invoice</span>
                </button>
                <button className="action-btn" onClick={() => window.location.href = '/add-product'}>
                  <span className="action-icon">📦</span>
                  <span>Add Product</span>
                </button>
                <button className="action-btn" onClick={() => window.location.href = '/clients'}>
                  <span className="action-icon">👤</span>
                  <span>Add Client</span>
                </button>
                <button className="action-btn" onClick={() => window.location.href = '/reports'}>
                  <span className="action-icon">📊</span>
                  <span>View Reports</span>
                </button>
              </div>

              <div style={{marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center'}}> 
                <label style={{color: '#94a3b8'}}>From</label>
                <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
                <label style={{color: '#94a3b8'}}>To</label>
                <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
                <button className="btn btn-ghost" onClick={()=>downloadCSVWithRange(startDate, endDate)}>Export CSV</button>
              </div>
            </section>

            {/* Recent Invoices & Top Users */}
            <section className="tables-grid">
              <div className="table-card">
                <h3>Recent Invoices</h3>
                <table className="simple-table">
                  <thead><tr><th>Invoice No</th><th>Date</th><th>Created By</th><th>Total</th><th>Items</th></tr></thead>
                  <tbody>
                    {invoices.length === 0 ? <tr><td colSpan={5} style={{color:'#94a3b8'}}>No invoices</td></tr> : invoices.map(inv => (
                      <tr key={inv.id}>
                        <td>{inv.invoice_no}</td>
                        <td>{new Date(inv.date).toLocaleDateString()}</td>
                        <td>{inv.created_by}</td>
                        <td>₹{inv.total.toLocaleString()}</td>
                        <td>{inv.item_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="table-card">
                <h3>Top Users</h3>
                <table className="simple-table">
                  <thead><tr><th>User</th><th>Invoices</th><th>Total Sales</th></tr></thead>
                  <tbody>
                    {(report?.sales_by_user || []).length === 0 ? <tr><td colSpan={3} style={{color:'#94a3b8'}}>No data</td></tr> : (report.sales_by_user || []).slice(0,10).map(u => (
                      <tr key={u.user_id}>
                        <td>{u.username || '—'}</td>
                        <td>{u.invoice_count}</td>
                        <td>₹{Number(u.total_sales).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default EnterpriseDashboard;
