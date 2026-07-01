import { useEffect, useState } from 'react';
import { MEMBERS } from '../data/data.js';
import { getSignatureUrl } from '../pdf/pdfUtils.js';

export default function SignatureSelect({ label, value, onChange }) {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!value) { setPreviewUrl(null); return; }
    getSignatureUrl(value)
      .then(url => { if (!cancelled) setPreviewUrl(url); })
      .catch(() => { if (!cancelled) setPreviewUrl(null); });
    return () => { cancelled = true; };
  }, [value]);

  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <select className="field-input" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">— none —</option>
        {MEMBERS.filter(m => m.signature).map(m => (
          <option key={m.id} value={m.signature}>
            {m.name} ({m.role})
          </option>
        ))}
      </select>
      {previewUrl && (
        <img
          src={previewUrl}
          alt="signature preview"
          className="sig-preview"
        />
      )}
    </div>
  );
}
