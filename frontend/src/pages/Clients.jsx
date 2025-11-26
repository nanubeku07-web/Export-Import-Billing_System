import React, { useState } from 'react';
import { Plus, Mail, Phone, Building2, Tag } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import { isAdmin } from '../utils/userRole';
import './Clients.css';

const Clients = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const userIsAdmin = isAdmin();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        type: 'regular'
    });

    const [clients, setClients] = useState([
        { id: 1, name: 'Rajesh Kumar', email: 'rajesh@textile.com', phone: '9876543210', company: 'Textile Exports', type: 'exporter', avatar: '👨‍💼' },
        { id: 2, name: 'Priya Singh', email: 'priya@imports.com', phone: '9123456789', company: 'Import Solutions', type: 'importer', avatar: '👩‍💼' },
        { id: 3, name: 'Ahmed Hassan', email: 'ahmed@trade.com', phone: '9876543211', company: 'Global Trade', type: 'premium', avatar: '🧔' },
        { id: 4, name: 'Emma Wilson', email: 'emma@logistics.com', phone: '9123456788', company: 'Logistics Plus', type: 'regular', avatar: '👩' },
    ]);

    const typeColors = {
        importer: 'importer',
        exporter: 'exporter',
        premium: 'premium',
        regular: 'regular'
    };

    const typeLabels = {
        importer: 'Importer',
        exporter: 'Exporter',
        premium: 'Premium',
        regular: 'Regular'
    };

    const handleAddClient = () => {
        if (formData.name && formData.email) {
            setClients([...clients, {
                id: clients.length + 1,
                ...formData,
                avatar: formData.name.charAt(0)
            }]);
            setFormData({ name: '', email: '', phone: '', company: '', type: 'regular' });
            setShowAddModal(false);
        }
    };

    return (
        <AdminLayout>
            <div className="clients">
                {/* Header */}
                <div className="clients-header">
                    <div>
                        <h1>Client Management</h1>
                        <p>Manage your clients and business relationships</p>
                    </div>
                    {userIsAdmin && (
                        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                            <Plus className="w-4 h-4" /> Add Client
                        </button>
                    )}
                </div>

                {/* Clients Table */}
                <div className="clients-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Client</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Company</th>
                                <th>Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map(client => (
                                <tr key={client.id}>
                                    <td>
                                        <div className="client-info">
                                            <div className="avatar">{client.avatar}</div>
                                            <span>{client.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-item">
                                            <Mail className="w-4 h-4" />
                                            {client.email}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-item">
                                            <Phone className="w-4 h-4" />
                                            {client.phone}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="company-info">
                                            <Building2 className="w-4 h-4" />
                                            {client.company}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`type-badge type-${typeColors[client.type]}`}>
                                            <Tag className="w-3 h-3" />
                                            {typeLabels[client.type]}
                                        </span>
                                    </td>
                                    <td>
                                        {userIsAdmin && (
                                            <div className="action-buttons">
                                                <button className="btn btn-sm btn-secondary">Edit</button>
                                                <button className="btn btn-sm btn-ghost">Delete</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Add Client Modal */}
                {showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>Add New Client</h2>
                            
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter client name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div className="form-group">
                                <label>Company</label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    placeholder="Enter company name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Client Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="regular">Regular</option>
                                    <option value="importer">Importer</option>
                                    <option value="exporter">Exporter</option>
                                    <option value="premium">Premium</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handleAddClient}>
                                    Add Client
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Clients;
