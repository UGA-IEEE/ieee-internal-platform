import { MEMBERS } from '../data/data.js';

export default function MemberSelect({ label = 'Select Member', value, onChange, onSelect }) {
  function handleChange(e) {
    const id = e.target.value;
    onChange(id);
    if (onSelect) {
      const member = MEMBERS.find(m => m.id === id) || null;
      onSelect(member);
    }
  }

  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <select className="field-input" value={value} onChange={handleChange}>
        <option value="">— choose —</option>
        {MEMBERS.map(m => (
          <option key={m.id} value={m.id}>
            {m.name} ({m.role})
          </option>
        ))}
      </select>
    </div>
  );
}
