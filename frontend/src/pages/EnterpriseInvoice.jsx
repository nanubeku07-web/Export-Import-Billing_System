import React, { useState, useEffect } from "react";
import { Search, Calendar, FileText, DollarSign, TrendingUp, Filter, X, Eye, Download, Plus } from "lucide-react";
import api from "../api";
import "./EnterpriseInvoice.css";

const EnterpriseInvoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    user: '',
    product: ''
  });

  useEffect(() => {
    fetchInvoices();
    fetchProducts();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.apiFetch('/api/invoices/');
      if (res.ok) {
        setInvoices(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch invoices", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.apiFetch('/api/products/');
      if (res.ok) setProducts(res.data);
    } catch (e) {
      console.error("Failed to fetch products", e);
    }
  };

  // Calculate stats
  const stats = {
    total: invoices.length,
    revenue: invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0),
    thisMonth: invoices.filter(inv => {
      const invDate = new Date(inv.date);
      const now = new Date();
      return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
    }).reduce((sum, inv) => sum + Number(inv.total || 0), 0),
    avgInvoice: invoices.length > 0 ? invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0) / invoices.length : 0
  };

  // Filter logic
  const filteredInvoices = invoices.filter(inv => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        inv.invoice_no?.toLowerCase().includes(searchLower) ||
        inv.customer?.toLowerCase().includes(searchLower) ||
        String(inv.created_by || '').toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Date filters
    if (filters.startDate) {
      const d = new Date(inv.date);
      const start = new Date(filters.startDate);
      if (d < start) return false;
    }
    if (filters.endDate) {
      const d = new Date(inv.date);
      const end = new Date(filters.endDate);
      if (d > end) return false;
    }

    // User filter
    if (filters.user && String(inv.created_by) !== filters.user) return false;

    // Product filter
    if (filters.product && inv.items) {
      const hasProd = inv.items.some(i =>
        i.product_detail?.name === filters.product || i.description === filters.product
      );
      if (!hasProd) return false;
    }

    return true;
  });

  // Get unique users from invoices
  const uniqueUsers = [...new Set(invoices.map(inv => inv.created_by).filter(Boolean))];

  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '', user: '', product: '' });
    setSearchTerm('');
  };

  const handleView = (invoiceId) => {
    window.open(`/invoices/${invoiceId}/preview`, '_blank');
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="enterprise-invoice-premium">
      {/* Header */}
      <div className="invoice-header">
        <div className="header-content">
          <div>
            <h1>All Invoices</h1>
            <p className="header-subtitle">Manage and track all customer invoices</p>
          </div>
          <button className="btn-primary-gradient" onClick={() => window.location.href = '/generate-invoice'}>
            <Plus className="w-4 h-4" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-icon stats-icon-blue">
            <FileText className="w-5 h-5" />
          </div>
          <div className="stats-content">
            <p className="stats-label">Total Invoices</p>
            <h3 className="stats-value">{stats.total}</h3>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon stats-icon-green">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="stats-content">
            <p className="stats-label">Total Revenue</p>
            <h3 className="stats-value">{formatCurrency(stats.revenue)}</h3>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon stats-icon-purple">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="stats-content">
            <p className="stats-label">This Month</p>
            <h3 className="stats-value">{formatCurrency(stats.thisMonth)}</h3>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon stats-icon-orange">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="stats-content">
            <p className="stats-label">Avg. Invoice</p>
            <h3 className="stats-value">{formatCurrency(stats.avgInvoice)}</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-grid">
          {/* Search */}
          <div className="filter-search">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Range */}
          <div className="filter-date-group">
            <div className="filter-date">
              <Calendar className="w-4 h-4" />
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                placeholder="Start date"
              />
            </div>
            <span className="date-separator">to</span>
            <div className="filter-date">
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                placeholder="End date"
              />
            </div>
          </div>

          {/* User Filter */}
          <select
            className="filter-select"
            value={filters.user}
            onChange={(e) => setFilters({ ...filters, user: e.target.value })}
          >
            <option value="">All Users</option>
            {uniqueUsers.map(userId => (
              <option key={userId} value={userId}>User {userId}</option>
            ))}
          </select>

          {/* Product Filter */}
          <select
            className="filter-select"
            value={filters.product}
            onChange={(e) => setFilters({ ...filters, product: e.target.value })}
          >
            <option value="">All Products</option>
            {products.map(product => (
              <option key={product.id} value={product.name}>{product.name}</option>
            ))}
          </select>

          {/* Clear Filters */}
          {(searchTerm || filters.startDate || filters.endDate || filters.user || filters.product) && (
            <button className="btn-clear-filters" onClick={clearFilters}>
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Invoice Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading invoices...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="empty-state">
            <FileText className="w-12 h-12" />
            <h3>No invoices found</h3>
            <p>Try adjusting your filters or create a new invoice</p>
          </div>
        ) : (
          <table className="invoice-table-premium">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>User</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(invoice => (
                <tr key={invoice.id}>
                  <td className="invoice-number">
                    <div className="invoice-number-cell">
                      <FileText className="w-4 h-4" />
                      {invoice.invoice_no}
                    </div>
                  </td>
                  <td className="customer-cell">{invoice.customer || '-'}</td>
                  <td>
                    <div className="user-badge">
                      <div className="user-avatar">U</div>
                      <span>User {invoice.created_by || '-'}</span>
                    </div>
                  </td>
                  <td className="date-cell">{formatDate(invoice.date)}</td>
                  <td className="amount-cell">{formatCurrency(invoice.total)}</td>
                  <td className="actions-cell">
                    <button
                      className="btn-action btn-action-view"
                      onClick={() => handleView(invoice.id)}
                      title="View Invoice"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Info */}
        {!loading && filteredInvoices.length > 0 && (
          <div className="table-footer">
            <p className="table-footer-text">
              Showing {filteredInvoices.length} of {invoices.length} invoices
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseInvoice;
