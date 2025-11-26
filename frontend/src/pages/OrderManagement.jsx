import React, { useState } from 'react';
import { Search, Filter, MapPin, Truck, Package, Clock, ChevronDown, FileText } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import './OrderManagement.css';

const OrderManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedShipment, setSelectedShipment] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Mock order data
    const orders = [
        {
            id: 'ORD-2024-001',
            customer: 'ABC Imports Ltd',
            origin: 'Shanghai, China',
            destination: 'Mumbai, India',
            status: 'delivered',
            shipmentMethod: 'sea-freight',
            items: 8,
            totalValue: 450000,
            date: '2024-11-15',
            containerNo: 'CONT-001',
            trackingNo: 'TRACK-001',
            customs: 'cleared',
            timeline: [
                { stage: 'Order Placed', date: '2024-11-15', completed: true },
                { stage: 'Confirmed', date: '2024-11-16', completed: true },
                { stage: 'Shipped', date: '2024-11-18', completed: true },
                { stage: 'In Transit', date: '2024-11-25', completed: true },
                { stage: 'Customs Clearance', date: '2024-12-01', completed: true },
                { stage: 'Delivered', date: '2024-12-03', completed: true },
            ],
            documents: [
                { name: 'Bill of Lading', type: 'bol', date: '2024-11-18' },
                { name: 'Commercial Invoice', type: 'invoice', date: '2024-11-15' },
                { name: 'Packing List', type: 'packing', date: '2024-11-15' },
                { name: 'Customs Declaration', type: 'customs', date: '2024-12-01' },
            ]
        },
        {
            id: 'ORD-2024-002',
            customer: 'XYZ Exports Co',
            origin: 'Bangalore, India',
            destination: 'Los Angeles, USA',
            status: 'in-transit',
            shipmentMethod: 'air-freight',
            items: 12,
            totalValue: 750000,
            date: '2024-11-20',
            containerNo: 'CONT-002',
            trackingNo: 'TRACK-002',
            customs: 'pending',
            timeline: [
                { stage: 'Order Placed', date: '2024-11-20', completed: true },
                { stage: 'Confirmed', date: '2024-11-21', completed: true },
                { stage: 'Shipped', date: '2024-11-22', completed: true },
                { stage: 'In Transit', date: '2024-11-25', completed: true },
                { stage: 'Customs Clearance', date: '2024-12-05', completed: false },
                { stage: 'Delivered', date: null, completed: false },
            ],
            documents: [
                { name: 'Airway Bill', type: 'awb', date: '2024-11-22' },
                { name: 'Commercial Invoice', type: 'invoice', date: '2024-11-20' },
                { name: 'Packing List', type: 'packing', date: '2024-11-20' },
            ]
        },
        {
            id: 'ORD-2024-003',
            customer: 'Global Trade Inc',
            origin: 'New York, USA',
            destination: 'Delhi, India',
            status: 'pending',
            shipmentMethod: 'sea-freight',
            items: 5,
            totalValue: 320000,
            date: '2024-11-28',
            containerNo: 'CONT-003',
            trackingNo: 'TRACK-003',
            customs: 'pending',
            timeline: [
                { stage: 'Order Placed', date: '2024-11-28', completed: true },
                { stage: 'Confirmed', date: '2024-11-29', completed: true },
                { stage: 'Shipped', date: '2024-12-02', completed: false },
                { stage: 'In Transit', date: null, completed: false },
                { stage: 'Customs Clearance', date: null, completed: false },
                { stage: 'Delivered', date: null, completed: false },
            ],
            documents: [
                { name: 'Proforma Invoice', type: 'invoice', date: '2024-11-28' },
                { name: 'Packing List', type: 'packing', date: '2024-11-28' },
            ]
        },
        {
            id: 'ORD-2024-004',
            customer: 'Tech Supplies Ltd',
            origin: 'Shenzhen, China',
            destination: 'Bangalore, India',
            status: 'delayed',
            shipmentMethod: 'sea-freight',
            items: 15,
            totalValue: 950000,
            date: '2024-11-05',
            containerNo: 'CONT-004',
            trackingNo: 'TRACK-004',
            customs: 'pending',
            timeline: [
                { stage: 'Order Placed', date: '2024-11-05', completed: true },
                { stage: 'Confirmed', date: '2024-11-06', completed: true },
                { stage: 'Shipped', date: '2024-11-08', completed: true },
                { stage: 'In Transit', date: '2024-11-20', completed: true },
                { stage: 'Customs Clearance', date: '2024-12-05', completed: false },
                { stage: 'Delivered', date: null, completed: false },
            ],
            documents: [
                { name: 'Bill of Lading', type: 'bol', date: '2024-11-08' },
                { name: 'Commercial Invoice', type: 'invoice', date: '2024-11-05' },
                { name: 'Packing List', type: 'packing', date: '2024-11-05' },
            ]
        },
    ];

    const statusConfig = {
        delivered: { label: 'Delivered', color: 'green', icon: '✓' },
        'in-transit': { label: 'In Transit', color: 'blue', icon: '→' },
        pending: { label: 'Pending', color: 'yellow', icon: '⏳' },
        delayed: { label: 'Delayed', color: 'red', icon: '⚠' },
    };

    const shipmentConfig = {
        'sea-freight': 'Sea Freight',
        'air-freight': 'Air Freight',
        'road-freight': 'Road Freight',
        courier: 'Courier',
    };

    const customsConfig = {
        cleared: { label: 'Cleared', color: 'green' },
        pending: { label: 'Pending', color: 'yellow' },
        rejected: { label: 'Rejected', color: 'red' },
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.customer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
        const matchesShipment = selectedShipment === 'all' || order.shipmentMethod === selectedShipment;
        return matchesSearch && matchesStatus && matchesShipment;
    });

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
    };

    return (
        <AdminLayout>
            <div className="order-management">
                {/* Header */}
                <div className="om-header">
                    <div>
                        <h1>Import & Export Orders</h1>
                        <p>Track shipments and manage orders across regions</p>
                    </div>
                    <div className="header-stats">
                        <div className="stat">
                            <span className="stat-value">{orders.length}</span>
                            <span className="stat-label">Total Orders</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">{orders.filter(o => o.status === 'delivered').length}</span>
                            <span className="stat-label">Delivered</span>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="search-filter-bar">
                    <div className="search-box">
                        <Search className="w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="filters-panel">
                        <div className="filter-group">
                            <label>Status</label>
                            <div className="filter-options">
                                <button
                                    className={`filter-btn ${selectedStatus === 'all' ? 'active' : ''}`}
                                    onClick={() => setSelectedStatus('all')}
                                >
                                    All
                                </button>
                                {Object.entries(statusConfig).map(([key, value]) => (
                                    <button
                                        key={key}
                                        className={`filter-btn ${selectedStatus === key ? 'active' : ''}`}
                                        onClick={() => setSelectedStatus(key)}
                                        style={{ borderColor: `var(--status-${value.color})` }}
                                    >
                                        {value.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <label>Shipment Method</label>
                            <div className="filter-options">
                                <button
                                    className={`filter-btn ${selectedShipment === 'all' ? 'active' : ''}`}
                                    onClick={() => setSelectedShipment('all')}
                                >
                                    All
                                </button>
                                {Object.entries(shipmentConfig).map(([key, value]) => (
                                    <button
                                        key={key}
                                        className={`filter-btn ${selectedShipment === key ? 'active' : ''}`}
                                        onClick={() => setSelectedShipment(key)}
                                    >
                                        {value}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Orders Table */}
                <div className="orders-container">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Route</th>
                                <th>Shipment</th>
                                <th>Status</th>
                                <th>Customs</th>
                                <th>Value</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order.id}>
                                    <td className="order-id">{order.id}</td>
                                    <td>{order.customer}</td>
                                    <td>
                                        <div className="route-info">
                                            <span className="origin">{order.origin.split(',')[0]}</span>
                                            <MapPin className="w-3 h-3" />
                                            <span className="destination">{order.destination.split(',')[0]}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="shipment-badge">
                                            <Truck className="w-3 h-3" />
                                            {shipmentConfig[order.shipmentMethod]}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${statusConfig[order.status].color}`}>
                                            {statusConfig[order.status].label}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`customs-badge customs-${customsConfig[order.customs].color}`}>
                                            {customsConfig[order.customs].label}
                                        </span>
                                    </td>
                                    <td>₹{order.totalValue.toLocaleString()}</td>
                                    <td>
                                        <button
                                            className="view-details-btn"
                                            onClick={() => handleViewDetails(order)}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredOrders.length === 0 && (
                        <div className="no-results">No orders found matching your criteria</div>
                    )}
                </div>

                {/* Details Modal */}
                {selectedOrder && (
                    <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <div>
                                    <h2>{selectedOrder.id}</h2>
                                    <p>{selectedOrder.customer}</p>
                                </div>
                                <button className="close-btn" onClick={() => setSelectedOrder(null)}>✕</button>
                            </div>

                            <div className="modal-body">
                                {/* Order Info */}
                                <div className="info-section">
                                    <h3>Order Information</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Container No</label>
                                            <span>{selectedOrder.containerNo}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Tracking No</label>
                                            <span>{selectedOrder.trackingNo}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Origin</label>
                                            <span>{selectedOrder.origin}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Destination</label>
                                            <span>{selectedOrder.destination}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Items</label>
                                            <span>{selectedOrder.items}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Total Value</label>
                                            <span>₹{selectedOrder.totalValue.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="timeline-section">
                                    <h3>Shipment Timeline</h3>
                                    <div className="timeline">
                                        {selectedOrder.timeline.map((event, idx) => (
                                            <div key={idx} className={`timeline-item ${event.completed ? 'completed' : ''}`}>
                                                <div className="timeline-marker">
                                                    {event.completed ? <Clock className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                                                </div>
                                                <div className="timeline-content">
                                                    <p className="timeline-stage">{event.stage}</p>
                                                    {event.date && <span className="timeline-date">{new Date(event.date).toLocaleDateString()}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Documents */}
                                <div className="documents-section">
                                    <h3>Documents</h3>
                                    <div className="documents-list">
                                        {selectedOrder.documents.map((doc, idx) => (
                                            <div key={idx} className="document-item">
                                                <FileText className="w-5 h-5" />
                                                <div className="document-info">
                                                    <p>{doc.name}</p>
                                                    <span>{new Date(doc.date).toLocaleDateString()}</span>
                                                </div>
                                                <button className="download-btn">Download</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default OrderManagement;
