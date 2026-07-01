import { useState } from 'react';
import MemberSelect from '../components/MemberSelect.jsx';
import SignatureSelect from '../components/SignatureSelect.jsx';
import PreviewModal from '../components/PreviewModal.jsx';
import { fillCENGR } from '../pdf/fillCENGR.js';
import { makeBlobUrl, downloadPdf } from '../pdf/pdfUtils.js';
import { MEMBERS, SPEEDTYPES } from '../data/data.js';

const defaultFacAdvisor  = MEMBERS.find(m => m.id === 'kyle')?.signature  || '';
const defaultCENGRApprover = MEMBERS.find(m => m.id === 'amber')?.signature || '';

const empty = {
  name: '', phone: '', email: '', clubName: 'Institute of Electrical and Electronics Engineers',
  expenseDate: '', expenseAmount: '', expenseType: '', accountType: '',
  purchased: '', justification: '',
  facultyAdvisorSig: defaultFacAdvisor, cengApproverSig: defaultCENGRApprover,
};

export default function CENGRForm({ onBack }) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = (k) => ({ value: form[k], onChange: e => set(k, e.target.value) });

  function handleMember(member) {
    if (!member) return;
    setForm(f => ({
      ...f,
      name: member.name,
      phone: member.phone,
      email: member.email,
    }));
  }

  async function handlePreview() {
    setLoading(true);
    try {
      const bytes = await fillCENGR(form);
      setPreview({ url: makeBlobUrl(bytes), filename: `CENGR_Reimbursement_${form.name || 'form'}.pdf`, bytes });
    } catch (e) { alert('Error: ' + e.message); }
    finally { setLoading(false); }
  }

  async function handleDownload() {
    setLoading(true);
    try {
      const bytes = await fillCENGR(form);
      downloadPdf(bytes, `CENGR_Reimbursement_${form.name || 'form'}.pdf`);
    } catch (e) { alert('Error: ' + e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="form-page">
      <div className="form-page-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1>CENGR Student Club Reimbursement</h1>
      </div>

      <div className="form-body">
        <section className="form-section">
          <h2>Person Requesting Reimbursement</h2>
          <MemberSelect label="Auto-fill from member" onSelect={handleMember} onChange={() => {}} value="" />
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Name</label>
              <input className="field-input" {...inp('name')} placeholder="Full name" />
            </div>
            <div className="field-group">
              <label className="field-label">Phone</label>
              <input className="field-input" {...inp('phone')} placeholder="xxx-xxx-xxxx" />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Email</label>
            <input className="field-input" {...inp('email')} placeholder="email@uga.edu" />
          </div>
          <div className="field-group">
            <label className="field-label">Student Club Name</label>
            <input className="field-input" {...inp('clubName')} />
          </div>
        </section>

        <section className="form-section">
          <h2>Expense Information</h2>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Expense Date</label>
              <input className="field-input" type="date" {...inp('expenseDate')} />
            </div>
            <div className="field-group">
              <label className="field-label">Expense Amount ($)</label>
              <input className="field-input" {...inp('expenseAmount')} placeholder="0.00" />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Expense Type</label>
            <div className="radio-group">
              {['food', 'travel', 'other'].map(opt => (
                <label key={opt} className="radio-label">
                  <input type="radio" name="expenseType" value={opt}
                    checked={form.expenseType === opt}
                    onChange={() => set('expenseType', opt)} />
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Account Type</label>
            <div className="radio-group">
              <label className="radio-label">
                <input type="radio" name="accountType" value="student"
                  checked={form.accountType === 'student'}
                  onChange={() => set('accountType', 'student')} />
                Student Activity ({SPEEDTYPES.studentActivity.value})
              </label>
              <label className="radio-label">
                <input type="radio" name="accountType" value="agency"
                  checked={form.accountType === 'agency'}
                  onChange={() => set('accountType', 'agency')} />
                Agency ({SPEEDTYPES.agency.value})
              </label>
              <label className="radio-label">
                <input type="radio" name="accountType" value="foundation"
                  checked={form.accountType === 'foundation'}
                  onChange={() => set('accountType', 'foundation')} />
                Foundation ({SPEEDTYPES.foundation.value})
              </label>
            </div>
          </div>

          <div className="speedtype-info">
            <span>Student Activity: <strong>{SPEEDTYPES.studentActivity.value}</strong></span>
            <span>Agency: <strong>{SPEEDTYPES.agency.value}</strong></span>
            <span>Foundation: <strong>{SPEEDTYPES.foundation.value}</strong></span>
          </div>

          <div className="field-group">
            <label className="field-label">Purchased (item description)</label>
            <input className="field-input" {...inp('purchased')} placeholder="What was purchased?" />
          </div>

          <div className="field-group">
            <label className="field-label">Justification</label>
            <textarea className="field-input field-textarea" {...inp('justification')}
              placeholder="Explain how this expense relates to IEEE club activities..." rows={4} />
          </div>
        </section>

        <section className="form-section">
          <h2>Approval Signatures</h2>
          <SignatureSelect label="Faculty Advisor Signature"
            value={form.facultyAdvisorSig}
            onChange={v => set('facultyAdvisorSig', v)} />
          <SignatureSelect label="CENGR Approver Signature"
            value={form.cengApproverSig}
            onChange={v => set('cengApproverSig', v)} />
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
        <PreviewModal
          url={preview.url}
          filename={preview.filename}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
