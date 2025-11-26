import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './GenerateInvoice.css';
import api from '../api';

const emptyLine = () => ({ product_id: null, description: '', hs_code: '', qty: 1, price: 0 });

const GenerateInvoice = () => {
  const [customer, setCustomer] = useState('');
  const [lines, setLines] = useState([emptyLine()]);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const invoiceRef = useRef(null);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [invalidLines, setInvalidLines] = useState(new Set());

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await api.apiFetch('/api/products/?for_invoice=1');
      if (res.ok) setProducts(res.data || []);
    } catch (e) {
      console.warn('Failed to load products', e);
    }
    setLoadingProducts(false);
  };

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const res = await api.apiFetch('/api/invoices/');
      if (res.ok) setInvoices(res.data || []);
      else if (res.status === 401 || res.status === 403) setMessage({ type: 'error', text: 'Login required to view saved invoices.' });
    } catch (e) {
      console.warn('Failed to load invoices', e);
    }
    setLoadingInvoices(false);
  };

  const addLine = () => setLines([...lines, emptyLine()]);
  const removeLine = (i) => setLines(lines.filter((_, idx) => idx !== i));

  const subtotal = lines.reduce((s, l) => s + (l.qty || 0) * (l.price || 0), 0);
  const tax = Math.round(subtotal * 0.12);
  const total = subtotal + tax;

  const handleCreate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // allow attempt; backend will respond with 403 if not permitted

    // validate lines: product, positive quantity, price defined
    const invalid = new Set();
    const items = [];
    lines.forEach((l, idx) => {
      const product = l.product_id;
      const qty = Number(l.qty || 0);
      const price = Number(l.price || 0);
      if (!product || qty <= 0 || Number.isNaN(price)) {
        invalid.add(idx);
      } else {
        items.push({ product, quantity: qty, price });
      }
    });

    if (invalid.size > 0) {
      setInvalidLines(invalid);
      setMessage({ type: 'error', text: 'Invoice must contain at least one valid line. Please fix highlighted lines.' });
      return;
    }

    if (items.length === 0) {
      setMessage({ type: 'error', text: 'Invoice must contain at least one line with a selected product, quantity and price.' });
      return;
    }

    const payload = { create_items: items };

    try {
      const res = await api.apiFetch('/api/invoices/', { method: 'POST', body: JSON.stringify(payload) });
      if (res.ok) {
        // set the returned invoice into preview so the user can view it immediately
        try {
          const created = res.data;
          if (created) setSelectedInvoice(created);
          // Refresh invoice list
          fetchInvoices();
          // Show success alert then redirect to preview page
          try {
            // small UI confirmation
            window.alert('Invoice created');
          } catch (e) { }
          // navigation is handled via the `navigate` hook declared at component top
          // use a ref to navigate if available
          setTimeout(() => {
            try {
              if (res.data && res.data.id) {
                navigate(`/invoices/${res.data.id}/preview`);
                return;
              }
              invoiceRef.current && invoiceRef.current.scrollIntoView({ behavior: 'smooth' });
            } catch (e) { }
          }, 150);
        } catch (e) { }
      } else {
        setMessage({ type: 'error', text: `Failed to create invoice: ${res.status} ${typeof res.data === 'object' ? JSON.stringify(res.data) : res.data}` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Create failed: ${err.message}` });
    }
  };

  const updateLine = (index, key, value) => {
    setLines(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: key === 'qty' || key === 'price' ? Number(value) : value };
      return copy;
    });

    // update invalidLines for this index if present
    setInvalidLines(prev => {
      const next = new Set(prev);
      // get the new candidate line after change from the latest prev state
      // we can't synchronously read updated lines here, so simply remove the index
      //; it will be re-validated on submit
      if (next.has(index)) next.delete(index);
      return next;
    });
  };

  const openModal = () => {
    setShowModal(true);
    fetchInvoices();
    // ensure products loaded for selection when modal opens
    if (products.length === 0) fetchProducts();
  };

  const closeModal = () => setShowModal(false);

  const handleSelectInvoice = (inv) => {
    setSelectedInvoice(inv);
    setShowModal(false);
  };

  const handlePrintInvoice = (inv) => {
    const payload = inv || selectedInvoice;
    if (!payload) {
      setMessage({ type: 'error', text: 'No invoice selected to print.' });
      return;
    }

    // Build a printable HTML string (simple, inline styles for fidelity)
    const rows = (payload.items || []).map(i => (
      `<tr>` +
      `<td style="padding:8px 6px">${(i.product_detail && i.product_detail.name) || i.product}</td>` +
      `<td style="padding:8px 6px">${i.quantity}</td>` +
      `<td style="padding:8px 6px">${formatCurrency(i.price)}</td>` +
      `<td style="padding:8px 6px; text-align:right">${formatCurrency(i.line_total)}</td>` +
      `</tr>`
    )).join('');

    const totalStr = formatCurrency(payload.total);

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${payload.invoice_no}</title>
      <style>body{font-family:system-ui,Segoe UI,Roboto,Arial;background:#fff;color:#111;padding:24px} .paper{max-width:800px;margin:0 auto;background:#fff;padding:28px;border-radius:4px} h1{margin:0 0 8px} table{width:100%;border-collapse:collapse} th{background:#2176a6;color:#fff;text-align:left;padding:8px 6px} td{color:#111}</style>
      </head><body><div class="paper">
      <h1>Invoice ${payload.invoice_no}</h1>
      <div style="display:flex;justify-content:space-between;margin-top:8px;color:#444">
        <div>Bill To: ${payload.created_by || '—'}</div>
        <div>Date: ${new Date(payload.date).toLocaleString()}</div>
      </div>
      <table style="margin-top:12px"><thead><tr><th>Description</th><th>Qty</th><th>Price</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>
        ${rows}
      </tbody></table>
      <div style="text-align:right;margin-top:16px;font-size:18px">Total: <strong>${totalStr}</strong></div>
      </div></body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.focus();
    // Give time for resources to layout then print
    setTimeout(() => { w.print(); }, 300);
  };

  const handleDownloadPdf = async (inv) => {
    const payload = inv || selectedInvoice;
    const invoiceData = payload || {
      invoice_no: 'DRAFT',
      date: new Date().toLocaleDateString(),
      customer,
      items: lines.map(l => ({
        description: l.description,
        quantity: l.qty,
        price: l.price,
        line_total: l.qty * l.price
      })),
      subtotal,
      tax,
      total,
      note
    };
    try {
      const jsPDFModule = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const { jsPDF } = jsPDFModule;
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });

      // Company header block (left) and invoice meta (right)
      const margin = 40;
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('TradeTrack Exports Pvt. Ltd.', margin, 60);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('123 Business Park, Andheri East, Mumbai 400099', margin, 76);
      doc.text('GSTIN: 27AAACT1234A1Z5', margin, 92);
      doc.text('Email: info@tradetrack.com | Phone: +91-22-12345678', margin, 108);

      // Invoice metadata on the right
      const pageWidth = doc.internal.pageSize.getWidth();
      const rightX = pageWidth - margin;
      doc.setFont('helvetica', 'bold');
      doc.text('Invoice', rightX - 120, 60);
      doc.setFont('helvetica', 'normal');
      doc.text(`No: ${invoiceData.invoice_no || 'DRAFT'}`, rightX - 120, 76);
      doc.text(`Date: ${invoiceData.date || new Date().toLocaleDateString()}`, rightX - 120, 92);
      doc.text(`Bill To: ${invoiceData.customer || '—'}`, rightX - 120, 108);

      // Build table rows (use plain numeric strings for PDF to avoid font glyph problems)
      const tableBody = (invoiceData.items || []).map((item) => [
        item.description || '',
        String(item.quantity || 0),
        Number(item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u00A0/g, ''),
        Number(item.line_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u00A0/g, '')
      ]);

      autoTable(doc, {
        head: [['Description', 'Qty', 'Price', 'Amount']],
        body: tableBody,
        startY: 140,
        theme: 'grid',
        headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: 'bold' },
        styles: { font: 'helvetica', fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { halign: 'center', cellWidth: 50 },
          2: { halign: 'right', cellWidth: 80 },
          3: { halign: 'right', cellWidth: 100 }
        }
      });

      let y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 18 : 180;

      // Totals summary (right-aligned)
      const totalLabelX = pageWidth - margin - 180;
      const totalValueX = pageWidth - margin;
      doc.setFont('helvetica', 'normal');
      // compute subtotal/tax/total from items if backend doesn't provide them
      const pdSubtotal = typeof invoiceData.subtotal === 'number' ? invoiceData.subtotal : (invoiceData.items || []).reduce((s, it) => s + Number(it.line_total || 0), 0);
      const pdTax = typeof invoiceData.tax === 'number' ? invoiceData.tax : +(pdSubtotal * 0.12).toFixed(2);
      const pdTotal = typeof invoiceData.total === 'number' ? invoiceData.total : +(pdSubtotal + pdTax).toFixed(2);

      doc.text('Subtotal:', totalLabelX, y, { align: 'left' });
      doc.text(Number(pdSubtotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u00A0/g, ''), totalValueX, y, { align: 'right' });
      y += 16;
      doc.text('Tax (12%):', totalLabelX, y, { align: 'left' });
      doc.text(Number(pdTax).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u00A0/g, ''), totalValueX, y, { align: 'right' });
      y += 16;
      doc.setFont('helvetica', 'bold');
      doc.text('Total:', totalLabelX, y, { align: 'left' });
      doc.text(Number(pdTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u00A0/g, ''), totalValueX, y, { align: 'right' });

      // Footer notes
      y += 28;
      doc.setFont('helvetica', 'normal');
      if (invoiceData.note) {
        doc.text('Note:', margin, y);
        doc.text(invoiceData.note, margin + 40, y);
        y += 18;
      }
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text('Bank: Axis Bank | A/C: 1234567890 | IFSC: AXIS0001234', margin, y);
      doc.text('Thank you for your business!', pageWidth / 2, y, { align: 'center' });

      const fileName = `Invoice_${(invoiceData.invoice_no || 'draft').replace(/[\\/:*?"<>|]/g, '_')}.pdf`;
      doc.save(fileName);
    } catch (err) {
      setMessage({ type: 'error', text: 'PDF generation requires `jspdf` and `jspdf-autotable`. Run `npm install jspdf jspdf-autotable` in the frontend folder.' });
    }
  };

  // helper to format currency without NBSPs or weird unicode
  const formatCurrency = (val) => {
    try {
      if (val === null || val === undefined) return '₹0';
      const n = Number(val) || 0;
      // use en-IN grouping and show two decimal places; remove NBSP which can render oddly
      return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u00A0/g, '')}`;
    } catch (e) {
      return `₹${val}`;
    }
  };

  // load products on mount so the select is ready in the page
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="invoice-page">
      <header className="invoice-hero">
        <div className="hero-left">
          <h1>Generate Invoice</h1>
          <p className="sub">Create professional invoices with ease</p>
        </div>
      </header>

      <main className="invoice-container">
        <form onSubmit={handleCreate} className="invoice-form card">
          {/* Customer Details Section */}
          <div className="form-section">
            <h3 style={{ marginBottom: 16, color: '#8be0ff' }}>Customer Information</h3>
            <div className="form-row">
              <label>Customer Name</label>
              <input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Enter customer or company name" />
            </div>
          </div>

          {/* Items Section */}
          <div className="form-section" style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 16, color: '#8be0ff' }}>Invoice Items</h3>

            {message && (
              <div className={`api-message ${message.type}`} style={{ marginBottom: 12 }}>
                {message.text}
              </div>
            )}

            <div style={{ marginBottom: 12, color: '#9fb0c7', fontSize: 13 }}>
              Available Products: {loadingProducts ? 'loading...' : products.length}
            </div>

            {/* Items Table */}
            <div className="items-table-wrapper">
              <table className="items-table">
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>Product</th>
                    <th style={{ width: '12%' }}>HS Code</th>
                    <th style={{ width: '25%' }}>Description</th>
                    <th style={{ width: '10%' }}>Qty</th>
                    <th style={{ width: '13%' }}>Price (₹)</th>
                    <th style={{ width: '13%' }}>Total (₹)</th>
                    <th style={{ width: '7%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, idx) => (
                    <tr key={idx} style={{
                      background: invalidLines.has(idx) ? 'rgba(220,100,100,0.1)' : 'transparent',
                      borderLeft: invalidLines.has(idx) ? '3px solid rgba(220,100,100,0.9)' : '3px solid transparent'
                    }}>
                      <td>
                        <select
                          value={line.product_id || ''}
                          onChange={(e) => {
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
                          }}
                          required
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#e6eef8' }}
                        >
                          <option value="">— Select —</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} - ₹{Number(p.price).toLocaleString()}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          value={line.hs_code || ''}
                          onChange={(e) => updateLine(idx, 'hs_code', e.target.value)}
                          placeholder="HS Code"
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#e6eef8' }}
                        />
                      </td>
                      <td>
                        <input
                          value={line.description}
                          onChange={(e) => updateLine(idx, 'description', e.target.value)}
                          placeholder="Description"
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#e6eef8' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={line.qty}
                          onChange={(e) => updateLine(idx, 'qty', e.target.value)}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#e6eef8', textAlign: 'center' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={line.price}
                          onChange={(e) => updateLine(idx, 'price', e.target.value)}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#e6eef8', textAlign: 'right' }}
                        />
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#60a5fa' }}>
                        ₹{Number((line.qty || 0) * (line.price || 0)).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" className="btn-ghost" onClick={addLine} style={{ marginTop: 12 }}>
              + Add Item
            </button>
          </div>

          {/* Action Buttons */}
          <div className="form-actions" style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" className="btn-secondary" onClick={() => openModal()}>Select Saved Invoice</button>
              <button type="button" className="btn-secondary" onClick={() => handleDownloadPdf()}>Print / Download Draft</button>
            </div>
            <button className="btn-primary" type="submit">Create Invoice</button>
          </div>
        </form>

        <aside className="preview card">
          <div className="invoice-paper" ref={invoiceRef}>
            {(() => {
              const inv = selectedInvoice || {
                invoice_no: 'DRAFT',
                date: new Date().toISOString(),
                created_by: null,
                items: lines.map(l => ({ product_detail: { name: l.description }, quantity: l.qty, price: l.price, line_total: (l.qty || 0) * (l.price || 0) })),
                total, subtotal, tax
              };

              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>Bill To:</h4>
                    <div style={{ fontWeight: 600 }}>{customer || (inv.created_by || '—')}</div>
                  </div>
                  <div className="sep" />
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: 8 }}>Description</th>
                        <th style={{ width: 60, textAlign: 'center' }}>Qty</th>
                        <th style={{ width: 100, textAlign: 'right' }}>Price</th>
                        <th style={{ width: 120, textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inv.items && inv.items.map((it, i) => (
                        <tr key={i}>
                          <td style={{ padding: 8 }}>{(it.product_detail && it.product_detail.name) || it.description || it.product}</td>
                          <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                          <td style={{ textAlign: 'right' }}>{formatCurrency(it.price)}</td>
                          <td style={{ textAlign: 'right' }}>{formatCurrency(it.line_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="preview-total">Total: <strong>{formatCurrency(inv.total || total)}</strong></div>
                </div>
              );
            })()}
          </div>
        </aside>

        {showModal && (
          <div className="invoice-modal-overlay" onClick={closeModal}>
            <div className="invoice-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Saved Invoices</h3>
              {loadingInvoices ? (
                <div>Loading...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {api.getToken() ? (
                    invoices.length === 0 ? <div>No saved invoices.</div> : invoices.map(inv => (
                      <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderBottom: '1px solid #222' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{inv.invoice_no}</div>
                          <div style={{ fontSize: 12, color: '#9fb0c7' }}>Date: {new Date(inv.date).toLocaleString()}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn-secondary" onClick={() => handleSelectInvoice(inv)}>Select</button>
                          <button className="btn-ghost" onClick={() => handlePrintInvoice(inv)}>Print</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>You must be logged in to view saved invoices.</div>
                  )}
                </div>
              )}
              <div style={{ textAlign: 'right', marginTop: 12 }}>
                <button className="btn-ghost" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div >
  );

};

export default GenerateInvoice;
