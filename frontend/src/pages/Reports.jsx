import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../api';
import './Reports.css';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoices, setInvoices] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      let path = '/api/reports/sales/';
      const params = [];
      if (startDate) params.push(`start_date=${encodeURIComponent(startDate)}`);
      if (endDate) params.push(`end_date=${encodeURIComponent(endDate)}`);
      if (params.length) path += '?' + params.join('&');
      const res = await api.apiFetch(path);
      if (!mounted) return;
      if (res.ok) { setReport(res.data); setError(null); }
      else {
        let msg = res.data || `Status ${res.status}`;
        if (res.status === 403) msg = 'Permission denied: ensure your account has report access.';
        setError(msg);
      }
      setLoading(false);
    }
    load();
    
    (async function loadInvoices(){
      let p = '/api/reports/invoices/';
      const ps = [];
      if (startDate) ps.push(`start_date=${encodeURIComponent(startDate)}`);
      if (endDate) ps.push(`end_date=${encodeURIComponent(endDate)}`);
      if (ps.length) p += '?' + ps.join('&');
      const r = await api.apiFetch(p);
      if (!mounted) return;
      if (r.ok) { setInvoices(r.data && r.data.invoices ? r.data.invoices : r.data); }
    })();
    return () => { mounted = false; };
  }, [startDate, endDate]);

  // Mock data for charts when backend data not available
  const mockMonthlyData = [
    { name: 'Jan', revenue: 45000, expenses: 32000 },
    { name: 'Feb', revenue: 52000, expenses: 38000 },
    { name: 'Mar', revenue: 48000, expenses: 35000 },
    { name: 'Apr', revenue: 61000, expenses: 42000 },
    { name: 'May', revenue: 55000, expenses: 39000 },
    { name: 'Jun', revenue: 67000, expenses: 45000 },
  ];

  const mockDailyData = [
    { date: 'Mon', sales: 12000 }, { date: 'Tue', sales: 15000 }, { date: 'Wed', sales: 11000 },
    { date: 'Thu', sales: 18000 }, { date: 'Fri', sales: 22000 }, { date: 'Sat', sales: 19000 },
    { date: 'Sun', sales: 14000 },
  ];

  const mockCategoryData = [
    { name: 'Apparel', value: 45 }, { name: 'Accessories', value: 30 },
    { name: 'Electronics', value: 15 }, { name: 'Others', value: 10 }
  ];

  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'];

  const handleExportCSV = () => {
    if (!report) return;
    const rows = [['product_id', 'product_name', 'total_quantity', 'total_sales']];
    (report.top_products || []).forEach(p => 
      rows.push([p.product_id, p.product_name, p.total_quantity, p.total_sales])
    );
    const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales_report.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales_report.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) return <AdminLayout><div className="reports"><div className="loading">Loading reports...</div></div></AdminLayout>;
  if (error) return (
    <AdminLayout>
      <div className="reports">
        <div className="error-message">
          <strong>Error:</strong> {String(error)}
        </div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="reports">
        {/* Header */}
        <div className="reports-header">
          <div>
            <h1>Reports & Analytics</h1>
            <p>Track sales performance and insights</p>
          </div>
          <div className="export-buttons">
            <button className="btn btn-secondary" onClick={handleExportCSV}>
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button className="btn btn-secondary" onClick={handleExportJSON}>
              <Download className="w-4 h-4" /> Export JSON
            </button>
          </div>
        </div>

        {/* Date Filters */}
        <div className="filter-section">
          <div className="filter-group">
            <label>Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Summary Cards */}
        {report && (
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon revenue">₹</div>
              <div className="card-content">
                <p>Total Revenue</p>
                <h3>{(report.total_sales || 0).toLocaleString()}</h3>
                <span className="change positive"><TrendingUp className="w-3 h-3" /> +12%</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon orders">📊</div>
              <div className="card-content">
                <p>Total Orders</p>
                <h3>{report.invoice_count || 0}</h3>
                <span className="change positive"><TrendingUp className="w-3 h-3" /> +8%</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon average">Ø</div>
              <div className="card-content">
                <p>Avg Order Value</p>
                <h3>₹{(report.total_sales / (report.invoice_count || 1) || 0).toLocaleString('en-IN', {maximumFractionDigits: 0})}</h3>
                <span className="change neutral">~0%</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon pending">⏳</div>
              <div className="card-content">
                <p>Pending Orders</p>
                <h3>12</h3>
                <span className="change negative">-3%</span>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Revenue vs Expenses */}
          <div className="chart-container">
            <h3>Monthly Revenue vs Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Sales Trend */}
          <div className="chart-container">
            <h3>Daily Sales Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockDailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="chart-container">
            <h3>Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Table */}
        {report && report.top_products && report.top_products.length > 0 && (
          <div className="table-container">
            <h3>Top Products</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Sales</th>
                </tr>
              </thead>
              <tbody>
                {report.top_products.map(p => (
                  <tr key={p.product_id}>
                    <td>{p.product_name}</td>
                    <td>{p.total_quantity}</td>
                    <td>₹{(p.total_sales || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent Invoices */}
        {invoices && invoices.length > 0 && (
          <div className="table-container">
            <h3>Recent Invoices</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Created By</th>
                  <th>Items</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 10).map(inv => (
                  <tr key={inv.id}>
                    <td>{inv.invoice_no || inv.id}</td>
                    <td>{inv.date ? new Date(inv.date).toLocaleDateString() : '—'}</td>
                    <td>{inv.created_by ? (inv.created_by.username || inv.created_by.email) : '—'}</td>
                    <td>{inv.items_count ?? (inv.items ? inv.items.length : '—')}</td>
                    <td>₹{(typeof inv.total !== 'undefined') ? Number(inv.total).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Reports;
