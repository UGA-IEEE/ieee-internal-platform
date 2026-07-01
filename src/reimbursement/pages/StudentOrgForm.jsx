import { useState } from 'react';
import MemberSelect from '../components/MemberSelect.jsx';
import PreviewModal from '../components/PreviewModal.jsx';
import { fillStudentOrg } from '../pdf/fillStudentOrg.js';
import { makeBlobUrl, downloadPdf } from '../pdf/pdfUtils.js';
import { ORG } from '../data/data.js';

const empty = {
  submitterName: '', submitterPhone: '',
  eventTitle: '', location: '', eventDate: '', numAttendees: '',
  numReceipts: '', totalAmount: '', foodAmount: '', nonFoodAmount: '',
  reimburseeName: '', reimEmail: '', reimPhone: '',
  street: '', city: '', zip: '',
};

export default function StudentOrgForm({ onBack }) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = (k, placeholder = '') => ({
    value: form[k],
    onChange: e => set(k, e.target.value),
    placeholder,
    className: 'field-input',
  });

  function handleSubmitter(member) {
    if (!member) return;
    setForm(f => ({ ...f, submitterName: member.name, submitterPhone: member.phone }));
  }

  function handleReimbursee(member) {
    if (!member) return;
    setForm(f => ({
      ...f,
      reimburseeName: member.name,
      reimEmail: member.email,
      reimPhone: member.phone,
      street: member.street,
      city: member.city,
      zip: member.zip,
    }));
  }

  async function handlePreview() {
    setLoading(true);
    try {
      const bytes = await fillStudentOrg(form);
      setPreview({ url: makeBlobUrl(bytes), filename: `StudentOrg_Reimbursement_${form.submitterName || 'form'}.pdf` });
    } catch (e) { alert('Error: ' + e.message); }
    finally { setLoading(false); }
  }

  async function handleDownload() {
    setLoading(true);
    try {
      const bytes = await fillStudentOrg(form);
      downloadPdf(bytes, `StudentOrg_Reimbursement_${form.submitterName || 'form'}.pdf`);
    } catch (e) { alert('Error: ' + e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="form-page">
      <div className="form-page-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1>Student Organization Reimbursement</h1>
      </div>

      <div className="form-body">
        <div className="prefilled-banner">
          Student Organization: <strong>Institute of Electrical and Electronics Engineers</strong> &nbsp;|&nbsp;
          Dept ID: <strong>{ORG.departmentId}</strong>
        </div>

        <section className="form-section">
          <h2>Submitter's Information</h2>
          <MemberSelect label="Auto-fill submitter" onSelect={handleSubmitter} onChange={() => {}} value="" />
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Your Name</label>
              <input {...inp('submitterName', 'Full name')} />
            </div>
            <div className="field-group">
              <label className="field-label">Your Phone #</label>
              <input {...inp('submitterPhone', 'xxx-xxx-xxxx')} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Event / Program Details</h2>
          <div className="field-group">
            <label className="field-label">Event/Program Title</label>
            <input {...inp('eventTitle', 'Event name')} />
          </div>
          <div className="field-group">
            <label className="field-label">Location</label>
            <input {...inp('location', 'Building / address')} />
          </div>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Date of Event</label>
              <input className="field-input" type="date" value={form.eventDate} onChange={e => set('eventDate', e.target.value)} />
            </div>
            <div className="field-group">
              <label className="field-label"># of Attendees</label>
              <input {...inp('numAttendees', '0')} type="number" min="0" />
            </div>
          </div>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label"># of Receipts</label>
              <input {...inp('numReceipts', '0')} type="number" min="0" />
            </div>
            <div className="field-group">
              <label className="field-label">Total Amount ($)</label>
              <input {...inp('totalAmount', '0.00')} />
            </div>
          </div>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Food / Consumable ($)</label>
              <input {...inp('foodAmount', '0.00')} />
            </div>
            <div className="field-group">
              <label className="field-label">Non-Food ($)</label>
              <input {...inp('nonFoodAmount', '0.00')} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Reimbursement Details</h2>
          <MemberSelect label="Auto-fill reimbursee" onSelect={handleReimbursee} onChange={() => {}} value="" />
          <div className="field-group">
            <label className="field-label">Who is Being Reimbursed?</label>
            <input {...inp('reimburseeName', 'Full name (as in UGA Supplier System)')} />
          </div>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Email Address</label>
              <input {...inp('reimEmail', 'email@uga.edu')} />
            </div>
            <div className="field-group">
              <label className="field-label">Phone Number</label>
              <input {...inp('reimPhone', 'xxx-xxx-xxxx')} />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Street Address</label>
            <input {...inp('street', '123 Main St')} />
          </div>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">City, State</label>
              <input {...inp('city', 'Athens, GA')} />
            </div>
            <div className="field-group">
              <label className="field-label">Zip Code</label>
              <input {...inp('zip', '30605')} />
            </div>
          </div>
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
