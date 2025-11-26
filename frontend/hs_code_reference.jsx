// Simple script to add HS Code field to invoice lines
// This will be inserted into GenerateInvoice.jsx

// In the invoice lines section, add HS Code input field after product selection:

{
    lines.map((line, idx) => (
        <div
            className="line"
            key={idx}
            style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                marginBottom: 8,
                padding: 6,
                borderRadius: 6,
                border: invalidLines.has(idx) ? '1px solid rgba(220,100,100,0.9)' : '1px solid transparent'
            }}
        >
            {/* Product Dropdown */}
            <select value={line.product_id || ''} onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                updateLine(idx, 'product_id', val);
                const prod = products.find(p => p.id === val);
                if (prod) {
                    updateLine(idx, 'description', prod.name);
                    updateLine(idx, 'hs_code', prod.hs_code || '');
                    updateLine(idx, 'price', Number(prod.price));
                } else {
                    updateLine(idx, 'description', '');
                    updateLine(idx, 'hs_code', '');
                    updateLine(idx, 'price', 0);
                }
            }} style={{ minWidth: 260 }}>
                <option value="">— Select product —</option>
                {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (₹{Number(p.price).toLocaleString()})</option>
                ))}
            </select>

            {/* HS Code Field - NEW */}
            <input
                value={line.hs_code || ''}
                onChange={(e) => updateLine(idx, 'hs_code', e.target.value)}
                placeholder="HS Code"
                style={{ width: 120 }}
            />

            {/* Description */}
            <input value={line.description} onChange={(e) => updateLine(idx, 'description', e.target.value)} placeholder="Description" style={{ flex: 1 }} />

            {/* Quantity */}
            <input type="number" min="1" value={line.qty} onChange={(e) => updateLine(idx, 'qty', e.target.value)} placeholder="Qty" style={{ width: 80 }} />

            {/* Price */}
            <input type="number" value={line.price} onChange={(e) => updateLine(idx, 'price', e.target.value)} placeholder="Price (₹)" style={{ width: 120 }} />

            {/* Line Total */}
            <div style={{ width: 120, textAlign: 'right' }}>₹{Number((line.qty || 0) * (line.price || 0)).toLocaleString()}</div>

            {/* Remove Button */}
            <button type="button" className="btn-danger" onClick={() => removeLine(idx)}>Remove</button>
        </div>
    ))
}
