const FORMS = [
  {
    id: 'cengr',
    title: 'CENGR Reimbursement',
    desc: 'CENGR Student Club expense reimbursement with faculty advisor approval.',
    icon: '🧾',
  },
  {
    id: 'student-org',
    title: 'Student Org Reimbursement',
    desc: 'Dean of Students reimbursement form for IEEE events and programs.',
    icon: '🎓',
  },
  {
    id: 'entertainment',
    title: 'Entertainment Form',
    desc: 'Reimbursement of university-related entertainment expenses.',
    icon: '🍽️',
  },
  {
    id: 'non-employee',
    title: 'Non-Employee Payment',
    desc: 'Payment or travel reimbursement for non-UGA employees.',
    icon: '💳',
  },
  {
    id: 'travel-auth',
    title: 'Travel Authorization',
    desc: 'Non-employee travel authorization form for UGA business travel.',
    icon: '✈️',
  },
];

export default function Home({ onSelect }) {
  return (
    <div className="home">
      <div className="home-header">
        <div className="home-logo">IEEE</div>
        <h1>UGA IEEE Finance Forms</h1>
        <p>Select a form to fill out and download</p>
      </div>
      <div className="card-grid">
        {FORMS.map(f => (
          <button key={f.id} className="form-card" onClick={() => onSelect(f.id)}>
            <span className="card-icon">{f.icon}</span>
            <h2 className="card-title">{f.title}</h2>
            <p className="card-desc">{f.desc}</p>
            <span className="card-cta">Fill Out →</span>
          </button>
        ))}
      </div>
    </div>
  );
}
