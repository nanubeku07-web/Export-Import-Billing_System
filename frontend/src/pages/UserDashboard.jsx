import React, { useEffect, useState } from 'react';
import { FileText, TrendingUp, Clock, DollarSign, Plus, Eye } from 'lucide-react';
import UserLayout from '../layouts/UserLayout';
import api from '../api';
import './UserDashboard.css';

const UserDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [report, setReport] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            const r = await api.apiFetch('/api/reports/sales/');
            if (mounted && r.ok) setReport(r.data);
            const inv = await api.apiFetch('/api/reports/invoices/');
            if (mounted && inv.ok) setInvoices(inv.data.invoices || []);
            setLoading(false);
        })();
        return () => { mounted = false; };
    }, []);

    const lastInvoice = invoices && invoices.length ? invoices[0] : null;

    return (
        <UserLayout>
            <div className="user-dashboard">
                {/* Header */}
                <div className="user-header">
                    <div>
                        <h1>My Account</h1>
                        <p>Manage your invoices and track your business</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => window.location.href = '/generate-invoice'}>
                        <Plus className="w-4 h-4" /> Create Invoice
                    </button>
                </div>

                {loading ? (
                    <div className="loading-state">Loading...</div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">Total Sales (30d)</div>
                                    <div className="stat-value">₹{(report?.total_sales || 0).toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #06b6d4, #22d3ee)' }}>
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">Invoices</div>
                                    <div className="stat-value">{report?.invoice_count || 0}</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">Avg Invoice</div>
                                    <div className="stat-value">₹{report?.invoice_count ? Math.round(report.total_sales / report.invoice_count).toLocaleString() : '0'}</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">Pending</div>
                                    <div className="stat-value">{invoices.filter(i => i.status === 'pending').length || 0}</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Invoices */}
                        <div className="recent-section">
                            <div className="section-header">
                                <h2>Recent Invoices</h2>
                                <a href="/invoices" className="view-all">View all →</a>
                            </div>

                            {invoices.length === 0 ? (
                                <div className="empty-state">
                                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <p>No invoices yet</p>
                                    <button className="btn btn-primary mt-4" onClick={() => window.location.href = '/generate-invoice'}>
                                        Create your first invoice
                                    </button>
                                </div>
                            ) : (
                                <div className="invoices-list">
                                    {invoices.slice(0, 5).map(inv => (
                                        <div key={inv.id} className="invoice-item">
                                            <div className="invoice-info">
                                                <div className="invoice-no">{inv.invoice_no}</div>
                                                <div className="invoice-date">{new Date(inv.date).toLocaleDateString()}</div>
                                            </div>
                                            <div className="invoice-amount">₹{inv.total.toLocaleString()}</div>
                                            <button className="invoice-action" onClick={() => window.location.href = `/invoices/${inv.id}/preview`}>
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Links */}
                        <div className="quick-links">
                            <a href="/user-products" className="quick-link">📦 View Products</a>
                            <a href="/user-inventory" className="quick-link">📊 View Inventory</a>
                        </div>
                    </>
                )}
            </div>
        </UserLayout>
    );
};

export default UserDashboard;
