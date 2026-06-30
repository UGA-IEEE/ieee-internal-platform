import { BRAND } from '../constants/brand'

export default function MemberSpotlightPost({ data }) {
  const {
    eyebrow = 'MEMBER SPOTLIGHT',
    name = 'Anthony Behrend',
    initials = 'AB',
    year = 'Sophomore',
    major = 'Electrical & Electronics Engineering',
    quote = 'IEEE gave me my first real networking opportunity — I landed my summer internship through a contact I made at an employer event.',
    skills = ['Embedded Systems', 'PCB Design', 'Python'],
  } = data

  const skillList = typeof skills === 'string'
    ? skills.split(',').map(s => s.trim()).filter(Boolean)
    : skills

  return (
    <div className="slide-root" style={{ background: BRAND.dark, padding: 32, justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 10, letterSpacing: '0.14em', color: BRAND.red, fontWeight: 700 }}>{eyebrow.toUpperCase()}</div>
        {/* Avatar */}
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: BRAND.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', margin: '12px 0 8px' }}>
          {initials || name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>{name}</div>
        <div style={{ fontSize: 12, color: BRAND.red, fontWeight: 600, margin: '2px 0 12px' }}>
          {year} · {major}
        </div>
        {/* Quote */}
        <div style={{ fontSize: 13, color: '#aaa', lineHeight: 1.65, fontStyle: 'italic', borderLeft: `2px solid ${BRAND.red}`, paddingLeft: 12 }}>
          "{quote}"
        </div>
        {/* Skills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
          {skillList.map((s, i) => (
            <span key={i} style={{ fontSize: 10, padding: '3px 8px', border: '0.5px solid #2a2a2a', borderRadius: 20, color: '#777' }}>
              {s}
            </span>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 10, color: '#333', letterSpacing: '0.06em' }}>{BRAND.orgName} · {BRAND.handle}</div>
    </div>
  )
}
