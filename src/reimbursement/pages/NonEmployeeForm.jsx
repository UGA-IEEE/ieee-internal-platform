import { useState } from 'react';
import MemberSelect from '../components/MemberSelect.jsx';
import SignatureSelect from '../components/SignatureSelect.jsx';
import PreviewModal from '../components/PreviewModal.jsx';
import { fillNonEmployee } from '../pdf/fillNonEmployee.js';
import { makeBlobUrl, downloadPdf } from '../pdf/pdfUtils.js';

const empty = {
  payeeName: '', payeeAddress: '', vendorNum: '',
  usCitizen: true, feeForServices: false, ugaStudent: true, employedByUga: false,
  businessPurpose: '',
  serviceAmt: '', serviceDates: '', serviceDesc: '',
  travelDates: '', miles: '', mileageRate: '', mileageTotal: '',
  perDiemDays: '', perDiemTotal: '', otherExpenses: '', grandTotal: '',
  payeeDate: '', approvalDate: '',
  payeeSig: '', approvalSig: '',
};

function YesNo({ label, value, onChange }) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <div className="radio-group">
        <label className="radio-label">
          <input type="radio" checked={value === true} onChange={() => onChange(true)} /> Yes
        </label>
        <label className="radio-label">
          <input type="radio" checked={value === false} onChange={() => onChange(false)} /> No
        </label>
      </div>
    </div>
  );
}

export default function NonEmployeeForm({ onBack }) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = (k, placeholder = '') => ({
    value: form[k], onChange: e => set(k, e.target.value),
    placeholder, className: 'field-input',
  });

  function handlePayee(member) {
    if (!member) return;
    const addr = [member.street, member.city, member.zip].filter(Boolean).join(', ');
    setForm(f => ({ ...f, payeeName: member.name, payeeAddress: addr }));
  }

  async function handlePreview() {
    setLoading(true);
    try {
      const bytes = await fillNonEmployee(form);
      setPreview({ url: makeBlobUrl(bytes), filename: `NonEmployee_Payment_${form.payeeName || 'form'}.pdf` });
    } catch (e) { alert('Error: ' + e.message); }
    finally { setLoading(false); }
  }

  async function handleDownload() {
    setLoading(true);
    try {
      const bytes = await fillNonEmployee(form);
      downloadPdf(bytes, `NonEmployee_Payment_${form.payeeName || 'form'}.pdf`);
    } catch (e) { alert('Error: ' + e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="form-page">
      <div className="form-page-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1>Non-Employee Payment Form</h1>
      </div>

      <div className="form-body">
        <section className="form-section">
          <h2>Payee Information</h2>
          <MemberSelect label="Auto-fill payee" onSelect={handlePayee} onChange={() => {}} value="" />
          <div className="field-group">
            <label className="field-label">1. Payee Name</label>
            <input {...inp('payeeName', 'Full legal name')} />
          </div>
          <div className="field-group">
            <label className="field-label">2. Payee Address</label>
            <input {...inp('payeeAddress', 'Street, City, State, ZIP')} />
          </div>
          <div className="field-group">
            <label className="field-label">3. Vendor Number (VN)</label>
            <input {...inp('vendorNum', 'UGA-assigned vendor number')} />
          </div>
        </section>

        <section className="form-section">
          <h2>Eligibility Questions</h2>
          <YesNo label="4. Is payee a US Citizen or Permanent Resident?" value={form.usCitizen} onChange={v => set('usCitizen', v)} />
          <YesNo label="5. Is the individual receiving a fee for services?" value={form.feeForServices} onChange={v => set('feeForServices', v)} />
          <YesNo label="6. Is this individual currently enrolled as a UGA student?" value={form.ugaStudent} onChange={v => set('ugaStudent', v)} />
          <YesNo label="7. Has the individual been employed by UGA within the last 24 months?" value={form.employedByUga} onChange={v => set('employedByUga', v)} />
          <div className="field-group">
            <label className="field-label">8. Business Purpose</label>
            <input {...inp('businessPurpose', 'Describe the business purpose')} />
          </div>
        </section>

        <section className="form-section">
          <h2>Payment for Services</h2>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Amount ($)</label>
              <input {...inp('serviceAmt', '0.00')} />
            </div>
            <div className="field-group">
              <label className="field-label">Date(s) Services Performed</label>
              <input {...inp('serviceDates', 'MM/DD/YYYY')} />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Type of Service Performed</label>
            <input {...inp('serviceDesc', 'Describe service')} />
          </div>
        </section>

        <section className="form-section">
          <h2>Travel Reimbursement</h2>
          <div className="field-group">
            <label className="field-label">Date(s) Travel Occurred</label>
            <input {...inp('travelDates', 'MM/DD/YYYY')} />
          </div>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Miles</label>
              <input {...inp('miles', '0')} type="number" min="0" />
            </div>
            <div className="field-group">
              <label className="field-label">Rate ($/mile)</label>
              <input {...inp('mileageRate', '0.67')} />
            </div>
            <div className="field-group">
              <label className="field-label">Mileage Total ($)</label>
              <input {...inp('mileageTotal', '0.00')} />
            </div>
          </div>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Days of Full Per Diem</label>
              <input {...inp('perDiemDays', '0')} type="number" min="0" />
            </div>
            <div className="field-group">
              <label className="field-label">Per Diem Total ($)</label>
              <input {...inp('perDiemTotal', '0.00')} />
            </div>
          </div>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Other Expenses ($)</label>
              <input {...inp('otherExpenses', '0.00')} />
            </div>
            <div className="field-group">
              <label className="field-label">Grand Total ($)</label>
              <input {...inp('grandTotal', '0.00')} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Signatures</h2>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Payee Date</label>
              <input className="field-input" type="date" value={form.payeeDate} onChange={e => set('payeeDate', e.target.value)} />
            </div>
            <div className="field-group">
              <label className="field-label">Approval Date</label>
              <input className="field-input" type="date" value={form.approvalDate} onChange={e => set('approvalDate', e.target.value)} />
            </div>
          </div>
          <SignatureSelect label="Payee Signature" value={form.payeeSig} onChange={v => set('payeeSig', v)} />
          <SignatureSelect label="Approved for Payment Signature" value={form.approvalSig} onChange={v => set('approvalSig', v)} />
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
