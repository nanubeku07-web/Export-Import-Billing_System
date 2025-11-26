import React, { useState, useEffect } from "react";
import api from "../api";

function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    price: "",
    stock: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    // If URL contains ?id=123 then load product for editing
    try {
      const qs = new URLSearchParams(window.location.search);
      const id = qs.get('id');
      if (id) {
        setEditingId(id);
        setLoading(true);
        api.apiFetch(`/api/products/${id}/`)
          .then(res => {
            if (res.ok && res.data) {
              const d = res.data;
              setFormData({ name: d.name || '', sku: d.sku || '', barcode: d.barcode || '', price: d.price || '', stock: d.stock || '' });
            } else {
              setMessage('Failed to load product for editing.');
            }
            setLoading(false);
          }).catch(err => { setMessage('Failed to load product.'); setLoading(false); });
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    const payload = { ...formData };
    if (editingId) {
      // update
      api.apiFetch(`/api/products/${editingId}/`, { method: 'PUT', body: JSON.stringify(payload) })
        .then(res => {
          if (res.ok) {
            setMessage('✅ Product updated successfully!');
          } else {
            setMessage('❌ Error updating product.');
          }
        }).catch(err => { setMessage('❌ Error updating product.'); });
      return;
    }

    // create
    api.apiFetch('/api/products/', { method: 'POST', body: JSON.stringify(payload) })
      .then(res => {
        if (res.ok) {
          setMessage('✅ Product added successfully!');
          setFormData({ name: '', sku: '', barcode: '', price: '', stock: '' });
        } else {
          setMessage('❌ Error adding product.');
        }
      })
      .catch(err => {
        console.error('Error:', err);
        setMessage('❌ Error adding product.');
      });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px", color: "#333" }}>
        {editingId ? 'Edit Product' : 'Add New Product'}
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "400px",
          backgroundColor: "#fff",
          padding: "20px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          borderRadius: "8px"
        }}
      >
        <div style={{ marginBottom: "15px" }}>
          <label>Name:</label><br />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>SKU:</label><br />
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Barcode:</label><br />
          <input
            type="text"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Price:</label><br />
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Stock:</label><br />
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          {editingId ? 'Save Product' : 'Add Product'}
        </button>
      </form>

      {message && <p style={{ marginTop: "20px" }}>{message}</p>}
    </div>
  );
}

export default AddProduct;
