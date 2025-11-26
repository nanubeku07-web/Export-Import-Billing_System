import React, { useState } from 'react';
import { Grid3x3, List, Plus, Search, AlertCircle } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import { isAdmin } from '../utils/userRole';
import './Inventory.css';

const Inventory = () => {
    const [viewMode, setViewMode] = useState('grid'); // grid or table
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const userIsAdmin = isAdmin();

    // Mock product data
    const products = [
        { id: 1, name: 'Cotton Shirts', sku: 'SKU-001', stock: 45, minStock: 20, category: 'Apparel', price: 1500, image: '👔' },
        { id: 2, name: 'Silk Scarves', sku: 'SKU-002', stock: 8, minStock: 15, category: 'Accessories', price: 800, image: '🧣' },
        { id: 3, name: 'Denim Jeans', sku: 'SKU-003', stock: 120, minStock: 50, category: 'Apparel', price: 2500, image: '👖' },
        { id: 4, name: 'Leather Belts', sku: 'SKU-004', stock: 3, minStock: 10, category: 'Accessories', price: 600, image: '⌚' },
        { id: 5, name: 'Wool Sweaters', sku: 'SKU-005', stock: 62, minStock: 30, category: 'Apparel', price: 3000, image: '🧶' },
        { id: 6, name: 'Cotton Socks', sku: 'SKU-006', stock: 0, minStock: 100, category: 'Accessories', price: 200, image: '🧦' },
    ];

    const categories = ['all', 'Apparel', 'Accessories'];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getStockStatus = (stock, minStock) => {
        if (stock === 0) return { status: 'Out of Stock', color: 'red' };
        if (stock < minStock) return { status: 'Low Stock', color: 'orange' };
        return { status: 'In Stock', color: 'green' };
    };

    return (
        <AdminLayout>
            <div className="inventory">
                {/* Header */}
                <div className="inventory-header">
                    <div>
                        <h1>Inventory Management</h1>
                        <p>Track products and manage stock levels</p>
                    </div>
                    {userIsAdmin && (
                        <button className="btn btn-primary">
                            <Plus className="w-4 h-4" /> Add Product
                        </button>
                    )}
                </div>

                {/* Filters & Controls */}
                <div className="inventory-controls">
                    <div className="search-box">
                        <Search className="w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="view-toggle">
                        <button
                            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Grid View"
                        >
                            <Grid3x3 className="w-4 h-4" />
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                            title="Table View"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {viewMode === 'grid' ? (
                    <div className="products-grid">
                        {filteredProducts.map(product => {
                            const { status, color } = getStockStatus(product.stock, product.minStock);
                            return (
                                <div key={product.id} className="product-card">
                                    <div className="product-image">{product.image}</div>
                                    <div className="product-info">
                                        <h3>{product.name}</h3>
                                        <p className="sku">{product.sku}</p>
                                        <p className="price">₹{product.price.toLocaleString()}</p>

                                        <div className={`stock-badge stock-${color}`}>
                                            {(status === 'Low Stock' || status === 'Out of Stock') && (
                                                <AlertCircle className="w-3 h-3" />
                                            )}
                                            {status}
                                        </div>

                                        <div className="stock-bar">
                                            <div className="bar-fill" style={{ width: `${Math.min((product.stock / product.minStock) * 100, 100)}%` }}></div>
                                        </div>

                                        <p className="stock-text">{product.stock} in stock</p>

                                        <div className="product-actions">
                                            {userIsAdmin && (
                                                <>
                                                    <button className="btn btn-sm btn-secondary">Edit</button>
                                                    <button className="btn btn-sm btn-ghost">Delete</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="products-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Min Stock</th>
                                    <th>Status</th>
                                    <th>Category</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => {
                                    const { status, color } = getStockStatus(product.stock, product.minStock);
                                    return (
                                        <tr key={product.id}>
                                            <td><span className="product-name">{product.image} {product.name}</span></td>
                                            <td>{product.sku}</td>
                                            <td>₹{product.price.toLocaleString()}</td>
                                            <td><strong>{product.stock}</strong></td>
                                            <td>{product.minStock}</td>
                                            <td>
                                                <span className={`status-badge status-${color}`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td>{product.category}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    {userIsAdmin && (
                                                        <>
                                                            <button className="btn btn-sm btn-secondary">Edit</button>
                                                            <button className="btn btn-sm btn-ghost">Delete</button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Inventory;
