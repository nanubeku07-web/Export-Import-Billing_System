import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const InvoicePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    let mounted = true;
    const doFetch = async () => {
      setLoading(true);
      try {
        const res = await api.apiFetch(`/api/invoices/${id}/`);
        if (!mounted) return;
        if (res.ok) setInvoice(res.data);
        else setMessage({ type: 'error', text: `Failed to load invoice (${res.status})` });
      } catch (e) {
        if (!mounted) return;
        setMessage({ type: 'error', text: `Failed to load invoice: ${e.message}` });
      }
      if (mounted) setLoading(false);
    };
    doFetch();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    // when invoice is loaded, generate a PDF blob URL for preview
    let active = true;
    let objectUrl = null;
    const gen = async () => {
      if (!invoice) return;
      try {
        const jsPDFModule = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;
        const { jsPDF } = jsPDFModule;
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const margin = 40;

        // Company header
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('TradeTrack Exports Pvt. Ltd.', margin, 60);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('123 Business Park, Andheri East, Mumbai 400099', margin, 76);
        doc.text('GSTIN: 27AAACT1234A1Z5', margin, 92);
        doc.text('Email: info@tradetrack.com | Phone: +91-22-12345678', margin, 108);

        // Invoice meta on right
        const pageWidth = doc.internal.pageSize.getWidth();
        const rightX = pageWidth - margin;
        doc.setFont('helvetica', 'bold');
        doc.text('Invoice', rightX - 120, 60);
        doc.setFont('helvetica', 'normal');
        doc.text(`No: ${invoice.invoice_no}`, rightX - 120, 76);
        doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, rightX - 120, 92);

        // table body (plain numeric strings for jsPDF to avoid unsupported glyphs)
        const body = (invoice.items || []).map(it => [
          (it.product_detail && it.product_detail.name) || it.product || '',
          String(it.quantity || ''),
          Number(it.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u00A0/g, ''),
          Number(it.line_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u00A0/g, '')
        ]);

        autoTable(doc, {
          head: [['Description', 'Qty', 'Price', 'Amount']],
          body,
          startY: 140,
          theme: 'grid',
          styles: { fontSize: 10 },
          columnStyles: { 0: { cellWidth: 'auto' }, 1: { halign: 'center', cellWidth: 50 }, 2: { halign: 'right', cellWidth: 80 }, 3: { halign: 'right', cellWidth: 100 } }
        });

        let y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 18 : 160;
        doc.setFontSize(11);
        const totalLabelX = pageWidth - margin - 180;
        const totalValueX = pageWidth - margin;
        doc.setFont('helvetica', 'normal');
        const pdSubtotal = typeof invoice.subtotal === 'number' ? invoice.subtotal : (invoice.items || []).reduce((s, it) => s + Number(it.line_total || 0), 0);
        const pdTax = typeof invoice.tax === 'number' ? invoice.tax : +(pdSubtotal * 0.12).toFixed(2);
        const pdTotal = typeof invoice.total === 'number' ? invoice.total : +(pdSubtotal + pdTax).toFixed(2);
        doc.text('Subtotal:', totalLabelX, y, { align: 'left' });
        doc.text(Number(pdSubtotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u00A0/g, ''), totalValueX, y, { align: 'right' });
        y += 16;
        doc.text('Tax (12%):', totalLabelX, y, { align: 'left' });
        doc.text(Number(pdTax).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u00A0/g, ''), totalValueX, y, { align: 'right' });
        y += 16;
        doc.setFont('helvetica', 'bold');
        doc.text('Total:', totalLabelX, y, { align: 'left' });
        doc.text(Number(pdTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u00A0/g, ''), totalValueX, y, { align: 'right' });

        const blob = doc.output('blob');
        objectUrl = URL.createObjectURL(blob);
        if (active) setPdfUrl(objectUrl);
      } catch (e) {
        console.warn('Failed to generate PDF preview', e);
      }
    };
    gen();
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [invoice]);

  const formatCurrency = (val) => {
    try {
      if (val === null || val === undefined) return '₹0.00';
      const n = Number(val) || 0;
      return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u00A0/g, '')}`;
    } catch (e) { return `₹${val}`; }
  };

  const handlePrint = () => {
    if (!invoice) return;
    const w = window.open('', '_blank');
    const rows = (invoice.items || []).map(i => `<tr><td>${(i.product_detail && i.product_detail.name)||i.product}</td><td>${i.quantity}</td><td>${formatCurrency(i.price)}</td><td style="text-align:right">${formatCurrency(i.line_total)}</td></tr>`).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${invoice.invoice_no}</title><style>body{font-family:system-ui,Segoe UI,Roboto,Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{padding:8px;border-bottom:1px solid #eee}</style></head><body><h1>Invoice ${invoice.invoice_no}</h1><div>Date: ${new Date(invoice.date).toLocaleString()}</div><table><thead><tr><th>Description</th><th>Qty</th><th>Price</th><th style="text-align:right">Amount</th></tr></thead><tbody>${rows}</tbody></table><div style="text-align:right;margin-top:12px">Total: <strong>${formatCurrency(invoice.total)}</strong></div></body></html>`;
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 250);
  };

  return (
    <div style={{padding:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <h2>Invoice Preview</h2>
        <div style={{display:'flex',gap:8}}>
          <button onClick={() => navigate(-1)} className="btn-ghost">Back</button>
          <button onClick={handlePrint} className="btn-secondary">Print</button>
        </div>
      </div>
      {message && <div style={{color:'#c33'}}>{message.text}</div>}
      {loading && <div>Loading...</div>}
      {!loading && invoice && (
        <div style={{maxWidth:900}}>
          {pdfUrl ? (
            <div>
              <div style={{marginBottom:8}}>
                <em>PDF preview below — you can print from the browser PDF viewer.</em>
              </div>
              <iframe title={`Invoice-${invoice.invoice_no}`} src={pdfUrl} style={{width:'100%',height:800,border:'1px solid #ddd'}} />
            </div>
          ) : (
            <div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontSize:18,fontWeight:700}}>TradeTrack</div>
                  <div>Bill To: {invoice.created_by || '—'}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div>Invoice: {invoice.invoice_no}</div>
                  <div>Date: {new Date(invoice.date).toLocaleString()}</div>
                </div>
              </div>
              <table style={{width:'100%',marginTop:12,borderCollapse:'collapse'}}>
                <thead>
                  <tr><th style={{textAlign:'left'}}>Description</th><th style={{width:60,textAlign:'center'}}>Qty</th><th style={{width:120,textAlign:'right'}}>Price</th><th style={{width:140,textAlign:'right'}}>Amount</th></tr>
                </thead>
                <tbody>
                  {invoice.items && invoice.items.map((it, idx) => (
                    <tr key={idx}><td style={{padding:8}}>{(it.product_detail && it.product_detail.name) || it.product}</td><td style={{textAlign:'center'}}>{it.quantity}</td><td style={{textAlign:'right'}}>{formatCurrency(it.price)}</td><td style={{textAlign:'right'}}>{formatCurrency(it.line_total)}</td></tr>
                  ))}
                </tbody>
              </table>
              <div style={{textAlign:'right',marginTop:12,fontSize:18}}>Total: <strong>{formatCurrency(invoice.total)}</strong></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoicePreview;
