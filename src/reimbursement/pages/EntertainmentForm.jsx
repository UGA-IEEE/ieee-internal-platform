import { useState } from 'react';
import PreviewModal from '../components/PreviewModal.jsx';
import { fillEntertainment } from '../pdf/fillEntertainment.js';
import { makeBlobUrl, downloadPdf } from '../pdf/pdfUtils.js';

const FUNDING_OPTIONS = [
  { key: 'fund0', label: 'UGA Foundation (Fund 20200)' },
  { key: 'fund1', label: 'UGARF Indirect Cost Return (Fund 20300, Class 64IDC)' },
  { key: 'fund2', label: 'Sponsored Funds (Fund 20000 or 213xx)' },
  { key: 'fund3', label: 'Royalty Revenue / Restricted-Non-Sponsored (Fund 20300/20400)' },
];

const emptyInd = () => ({ name: '', relationship: '' });

const empty = {
  fundingSources: [],
  amount: '',
  timePlace: '',
  purpose: '',
  individuals: [emptyInd(), emptyInd(), emptyInd()],
};

export default function EntertainmentForm({ onBack }) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function toggleFund(key) {
    setForm(f => {
      const src = f.fundingSources.includes(key)
        ? f.fundingSources.filter(k => k !== key)
        : [...f.fundingSources, key];
      return { ...f, fundingSources: src };
    });
  }

  function setInd(i, field, val) {
    setForm(f => {
      const inds = [...f.individuals];
      inds[i] = { ...inds[i], [field]: val };
      return { ...f, individuals: inds };
    });
  }

  function addIndividual() {
    setForm(f => ({ ...f, individuals: [...f.individuals, emptyInd()] }));
  }

  async function handlePreview() {
    setLoading(true);
    try {
      const bytes = await fillEntertainment(form);
      setPreview({ url: makeBlobUrl(bytes), filename: 'Entertainment_Form.pdf' });
    } catch (e) { alert('Error: ' + e.message); }
    finally { setLoading(false); }
  }

  async function handleDownload() {
    setLoading(true);
    try {
      const bytes = await fillEntertainment(form);
      downloadPdf(bytes, 'Entertainment_Form.pdf');
    } catch (e) { alert('Error: ' + e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="form-page">
      <div className="form-page-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1>Reimbursement of University Related Entertainment</h1>
      </div>

      <div className="form-body">
        <section className="form-section">
          <h2>(1) Source of Funding</h2>
          {FUNDING_OPTIONS.map(opt => (
            <label key={opt.key} className="checkbox-label">
              <input type="checkbox"
                checked={form.fundingSources.includes(opt.key)}
                onChange={() => toggleFund(opt.key)} />
              {opt.label}
            </label>
          ))}
        </section>

        <section className="form-section">
          <h2>(2) Amount to be Reimbursed</h2>
          <div className="field-group">
            <label className="field-label">Amount ($)</label>
            <input className="field-input" value={form.amount}
              onChange={e => set('amount', e.target.value)} placeholder="0.00" />
          </div>
        </section>

        <section className="form-section">
          <h2>(3) Time and Place of Occasion</h2>
          <div className="field-group">
            <textarea className="field-input field-textarea"
              value={form.timePlace}
              onChange={e => set('timePlace', e.target.value)}
              placeholder="Date(s) and location(s) of the entertainment" rows={2} />
          </div>
        </section>

        <section className="form-section">
          <h2>(4) University Related Purpose</h2>
          <div className="field-group">
            <textarea className="field-input field-textarea"
              value={form.purpose}
              onChange={e => set('purpose', e.target.value)}
              placeholder="How does this relate to university program purposes?" rows={3} />
          </div>
        </section>

        <section className="form-section">
          <h2>(5) Individuals Entertained</h2>
          <p className="section-hint">If more than 10, use categories (e.g., "IEEE members").</p>
          <div className="individuals-header">
            <span>Name / Category</span>
            <span>Relationship to University</span>
          </div>
          {form.individuals.map((ind, i) => (
            <div key={i} className="individual-row">
              <input className="field-input"
                value={ind.name} placeholder={`Person ${i + 1}`}
                onChange={e => setInd(i, 'name', e.target.value)} />
              <input className="field-input"
                value={ind.relationship} placeholder="e.g., IEEE Member, UGA Student"
                onChange={e => setInd(i, 'relationship', e.target.value)} />
            </div>
          ))}
          {form.individuals.length < 12 && (
            <button className="btn-add" onClick={addIndividual}>+ Add Row</button>
          )}
        </section>

        <div className="form-actions">
          <button className="btn-secondary" onClick={() => setForm(empty)}>Reset</button>
          <button className="btn-secondary" onClick={handlePreview} disabled={loading}>
            {loading ? 'Loading…' : 'Preview PDF'}
          </button>
          <button className="btn-primary" onClick={handleDownload} disabled={loading}>
            Download PDF
          </button>
        </div>
      </div>

      {preview && (
        <PreviewModal url={preview.url} filename={preview.filename} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}
