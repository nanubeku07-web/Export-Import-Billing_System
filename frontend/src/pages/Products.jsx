import React, { useState, useEffect } from "react";
import "./Products.css";
import api from '../api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({ name: "", stock: "", price: "" });

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
    return () => { mounted = false };
  }, []);

  // Filter products by search
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this product?");
    if (!confirmDelete) return;

    try {
      const res = await api.apiFetch(`/api/products/${id}/`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete product");
      }
    } catch (e) {
      alert("Error deleting product");
    }
  };

  const startEdit = (p) => {
    // Try to fetch fresh product details from API (handles stale lists)
    setError(null);
    (async () => {
      const res = await api.apiFetch(`/api/products/${p.id}/`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('Product not found on server (maybe deleted). Refreshing list.');
          // remove from local list
          setProducts((prev) => prev.filter(item => item.id !== p.id));
          return;
        }
        setError(`Failed to load product: ${res.status}`);
        return;
      }
      const data = res.data;
      setEditingId(p.id);
      setEditingData({ name: data.name || '', stock: String(data.stock || 0), price: String(data.price || 0) });
    })();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData({ name: "", stock: "", price: "" });
  };

  const saveEdit = (id) => {
    setError(null);
    (async () => {
      const payload = {
        name: editingData.name,
        stock: Number(editingData.stock) || 0,
        price: Number(editingData.price) || 0,
      };
      const res = await api.apiFetch(`/api/products/${id}/`, { method: 'PUT', body: JSON.stringify(payload) });
      if (!res.ok) {
        if (res.status === 404) {
          setError('Product not found on server (may have been deleted).');
          setEditingId(null);
          return;
        }
        setError(`Failed to save product (status ${res.status})`);
        return;
      }
      // update local list with returned data if available
      const updatedProduct = res.data || { id, ...payload };
      setProducts((prev) => prev.map(p => p.id === id ? updatedProduct : p));
      cancelEdit();
    })();
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Products</h1>

        <button
          className="add-btn"
          onClick={() => (window.location.href = "/add-product")}
        >
          + Add New Product
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        className="search-bar"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading && <div style={{ marginTop: 8, color: '#666' }}>Loading products…</div>}
      {error && <div style={{ marginTop: 8, color: '#c66' }}>{error}</div>}

      {/* Products Table */}
      <table className="products-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Stock</th>
            <th>Price (₹)</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                No products found.
              </td>
            </tr>
          ) : (
            filteredProducts.map((p) => (
              <React.Fragment key={p.id}>
                {editingId === p.id ? (
                  <tr>
                    <td>
                      <input type="text" value={editingData.name} onChange={(e) => setEditingData({ ...editingData, name: e.target.value })} />
                    </td>
                    <td>
                      <input type="number" value={editingData.stock} onChange={(e) => setEditingData({ ...editingData, stock: e.target.value })} style={{ width: 80 }} />
                    </td>
                    <td>
                      <input type="number" value={editingData.price} onChange={(e) => setEditingData({ ...editingData, price: e.target.value })} style={{ width: 120 }} />
                    </td>
                    <td>
                      <button className="edit-btn" onClick={() => saveEdit(p.id)}>Save</button>
                      <button className="delete-btn" onClick={cancelEdit}>Cancel</button>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td>{p.name}</td>
                    <td>{p.stock}</td>
                    <td>₹{p.price}</td>
                    <td>
                      <button className="edit-btn" onClick={() => startEdit(p)}>Edit</button>

                      <button className="delete-btn" onClick={() => handleDelete(p.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Products;
