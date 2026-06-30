import { BRAND } from '../constants/brand'

const DEFAULT_MEMBERS = [
  { initials: 'JC', name: 'Jun Chambers', role: 'President' },
  { initials: 'SJ', name: 'Sidney Johnson', role: 'Vice President' },
  { initials: 'JC', name: 'Joshua Carter', role: 'Outreach Director' },
  { initials: 'JB', name: 'Jacob Bennett', role: 'Engineering Director' },
  { initials: 'DT', name: 'Dillon Thomas', role: 'Treasurer' },
  { initials: 'MM', name: 'Mary Magallanes', role: 'Secretary' },
  { initials: 'ZA', name: 'Zeeshan Ali', role: 'First-Year Advisor' },
  { initials: 'AB', name: 'Anthony Behrend', role: 'First-Year Advisor' },
]

export default function EBoardPost({ data }) {
  const {
    year = '2026–27',
    eyebrow = 'MEET YOUR E-BOARD',
    headline = "Introducing this year's leadership team.",
    members = DEFAULT_MEMBERS,
  } = data

  const memberList = typeof members === 'string'
    ? members.split('\n').map(line => {
        const parts = line.split(',').map(s => s.trim())
        return { name: parts[0] || '', role: parts[1] || '', initials: (parts[0] || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() }
      }).filter(m => m.name)
    : members

  return (
    <div className="slide-root" style={{ background: BRAND.dark, padding: 28, justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 10, letterSpacing: '0.14em', color: BRAND.red, fontWeight: 700 }}>
          {eyebrow.toUpperCase()}
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.15, margin: '6px 0 16px' }}>
          {headline}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {memberList.slice(0, 6).map((m, i) => (
            <div key={i} style={{ background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: BRAND.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {m.initials || m.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                <div style={{ fontSize: 10, color: BRAND.red, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: '#333', letterSpacing: '0.06em' }}>{BRAND.orgName} · {BRAND.handle}</span>
        <span style={{ background: BRAND.red, color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 3, letterSpacing: '0.06em' }}>{year}</span>
      </div>
    </div>
  )
}
