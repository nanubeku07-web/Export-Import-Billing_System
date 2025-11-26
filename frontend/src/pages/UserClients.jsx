import React, { useState } from 'react';
import { Users, Mail, Phone, Building2, Tag } from 'lucide-react';
import UserLayout from '../layouts/UserLayout';
import './Clients.css';

const UserClients = () => {
    const [clients] = useState([
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

    return (
        <UserLayout>
            <div className="clients">
                {/* Header */}
                <div className="clients-header">
                    <div>
                        <h1>My Clients</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>View your client information</p>
                    </div>
                </div>

                {/* Clients Table - View Only */}
                <div className="clients-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Client</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Company</th>
                                <th>Type</th>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </UserLayout>
    );
};

export default UserClients;
