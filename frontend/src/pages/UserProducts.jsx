import React, { useState, useEffect } from "react";
import { Package, Search } from 'lucide-react';
import UserLayout from '../layouts/UserLayout';
import api from '../api';
import "./Products.css";

const UserProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            const res = await api.apiFetch('/api/products/');
            if (!mounted) return;
            setLoading(false);
            if (!res.ok) {
                setError(`Failed to load products (status ${res.status})`);
                return;
            }
            setProducts(res.data || []);
        };
        load();
        return () => { mounted = false; };
    }, []);

    // Filter products by search
    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <UserLayout>
            <div className="products-container">
                <div className="products-header">
                    <div>
                        <h1>My Products</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>View your available products inventory</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', marginBottom: '24px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'var(--text-tertiary)' }} />
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: '44px' }}
                    />
                </div>

                {loading && <div style={{ marginTop: 8, color: 'var(--text-secondary)' }}>Loading products…</div>}
                {error && <div style={{ marginTop: 8, color: 'var(--danger)' }}>{error}</div>}

                {/* Products Table - View Only */}
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Stock</th>
                            <th>Price (₹)</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan="3" style={{ textAlign: "center", padding: "40px", color: 'var(--text-secondary)' }}>
                                    <Package style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
                                    <div>No products found.</div>
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.name}</td>
                                    <td><strong>{p.stock}</strong></td>
                                    <td>₹{p.price}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </UserLayout>
    );
};

export default UserProducts;
