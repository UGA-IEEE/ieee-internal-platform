import { useState } from 'react';
import MemberSelect from '../components/MemberSelect.jsx';
import SignatureSelect from '../components/SignatureSelect.jsx';
import PreviewModal from '../components/PreviewModal.jsx';
import { fillTravelAuth } from '../pdf/fillTravelAuth.js';
import { makeBlobUrl, downloadPdf } from '../pdf/pdfUtils.js';
import { SPEEDTYPES } from '../data/data.js';

const defaultFacAdvisor = '';

const empty = {
  travelerName: '', travelerEmail: '', travelerPhone: '', mailingAddress: '',
  departLoc: 'Athens, GA', finalDest: '', departDate: '', returnDate: '',
  primaryPurpose: '', justification: '',
  deptContact: 'Kyle Johnsen', contactEmail: '', contactPhone: '',
  meals: '', lodging: '', transportation: '', other: '', total: '',
  internationalTravel: false, restrictedCountry: false, exportControlled: false,
  speedtype: SPEEDTYPES.studentActivity.value, accountCode: '', amount: '',
  travelerDate: '', deptHeadDate: '',
  travelerSig: '', deptHeadSig: defaultFacAdvisor,
};

export default function TravelAuthForm({ onBack }) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = (k, placeholder = '') => ({
    value: form[k], onChange: e => set(k, e.target.value),
    placeholder, className: 'field-input',
  });

  function handleTraveler(member) {
    if (!member) return;
    const addr = [member.street, member.city, member.zip].filter(Boolean).join(', ');
    setForm(f => ({
      ...f,
      travelerName: member.name,
      travelerEmail: member.email,
      travelerPhone: member.phone,
      mailingAddress: addr,
      travelerSig: member.signature,
    }));
  }

  async function handlePreview() {
    setLoading(true);
    try {
      const bytes = await fillTravelAuth(form);
      setPreview({ url: makeBlobUrl(bytes), filename: `TravelAuth_${form.travelerName || 'form'}.pdf` });
    } catch (e) { alert('Error: ' + e.message); }
    finally { setLoading(false); }
  }

  async function handleDownload() {
    setLoading(true);
    try {
      const bytes = await fillTravelAuth(form);
      downloadPdf(bytes, `TravelAuth_${form.travelerName || 'form'}.pdf`);
    } catch (e) { alert('Error: ' + e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="form-page">
      <div className="form-page-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1>Non-Employee Travel Authorization</h1>
      </div>

      <div className="form-body">
        <section className="form-section">
          <h2>Traveler Information</h2>
          <MemberSelect label="Auto-fill traveler" onSelect={handleTraveler} onChange={() => {}} value="" />
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Traveler's Name</label>
              <input {...inp('travelerName', 'Full name')} />
            </div>
            <div className="field-group">
              <label className="field-label">Email</label>
              <input {...inp('travelerEmail', 'email@uga.edu')} />
            </div>
            <div className="field-group">
              <label className="field-label">Phone</label>
              <input {...inp('travelerPhone', 'xxx-xxx-xxxx')} />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Mailing Address</label>
            <input {...inp('mailingAddress', '123 Main St, Athens, GA 30605')} />
          </div>
        </section>

        <section className="form-section">
          <h2>Trip Details</h2>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Departure Location</label>
              <input {...inp('departLoc', 'Athens, GA')} />
            </div>
            <div className="field-group">
              <label className="field-label">Final Destination</label>
              <input {...inp('finalDest', 'City, State')} />
            </div>
          </div>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Departure Date</label>
              <input className="field-input" type="date" value={form.departDate} onChange={e => set('departDate', e.target.value)} />
            </div>
            <div className="field-group">
              <label className="field-label">Return Date</label>
              <input className="field-input" type="date" value={form.returnDate} onChange={e => set('returnDate', e.target.value)} />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Primary Purpose of Trip</label>
            <input {...inp('primaryPurpose', 'Conference, competition, etc.')} />
          </div>
          <div className="field-group">
            <label className="field-label">Justification for Travel</label>
            <textarea className="field-input field-textarea" value={form.justification}
              onChange={e => set('justification', e.target.value)}
              placeholder="Why is this travel necessary for IEEE?" rows={3} />
          </div>
        </section>

        <section className="form-section">
          <h2>Department Contact</h2>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Contact Name</label>
              <input {...inp('deptContact')} />
            </div>
            <div className="field-group">
              <label className="field-label">Contact Email</label>
              <input {...inp('contactEmail', 'email@uga.edu')} />
            </div>
            <div className="field-group">
              <label className="field-label">Contact Phone</label>
              <input {...inp('contactPhone', 'xxx-xxx-xxxx')} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Expense Estimates</h2>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Meals ($)</label>
              <input {...inp('meals', '0.00')} />
            </div>
            <div className="field-group">
              <label className="field-label">Lodging ($)</label>
              <input {...inp('lodging', '0.00')} />
            </div>
            <div className="field-group">
              <label className="field-label">Transportation ($)</label>
              <input {...inp('transportation', '0.00')} />
            </div>
            <div className="field-group">
              <label className="field-label">Other ($)</label>
              <input {...inp('other', '0.00')} />
            </div>
            <div className="field-group">
              <label className="field-label">Total ($)</label>
              <input {...inp('total', '0.00')} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>International Travel Questions</h2>
          {[
            ['internationalTravel', 'Does this trip involve international travel?'],
            ['restrictedCountry',   'Does the itinerary include travel to Cuba, Iran, North Korea, Sudan, Syria, or Ukraine?'],
            ['exportControlled',    'Will you hand-carry or ship abroad any UGA-owned items?'],
          ].map(([key, label]) => (
            <div key={key} className="field-group">
              <label className="field-label">{label}</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" checked={form[key] === true}  onChange={() => set(key, true)}  /> Yes
                </label>
                <label className="radio-label">
                  <input type="radio" checked={form[key] === false} onChange={() => set(key, false)} /> No
                </label>
              </div>
            </div>
          ))}
        </section>

        <section className="form-section">
          <h2>Financial Coding</h2>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Amount ($)</label>
              <input {...inp('amount', '0.00')} />
            </div>
            <div className="field-group">
              <label className="field-label">Speedtype</label>
              <select className="field-input" value={form.speedtype} onChange={e => set('speedtype', e.target.value)}>
                {Object.values(SPEEDTYPES).map(s => (
                  <option key={s.value} value={s.value}>{s.label} — {s.value}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Account Code</label>
              <input {...inp('accountCode', 'e.g., 711101')} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Signatures</h2>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Traveler Date</label>
              <input className="field-input" type="date" value={form.travelerDate} onChange={e => set('travelerDate', e.target.value)} />
            </div>
            <div className="field-group">
              <label className="field-label">Department Head Date</label>
              <input className="field-input" type="date" value={form.deptHeadDate} onChange={e => set('deptHeadDate', e.target.value)} />
            </div>
          </div>
          <SignatureSelect label="Traveler Signature" value={form.travelerSig} onChange={v => set('travelerSig', v)} />
          <SignatureSelect label="Department Head Signature" value={form.deptHeadSig} onChange={v => set('deptHeadSig', v)} />
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
