import { BRAND } from '../constants/brand'

export default function AppsOpenClassic({ data }) {
  const {
    badge = 'APPLICATIONS OPEN',
    kicker = "WE'RE LOOKING FOR",
    headline = 'Future MicroMouse Members.',
    roles = ['Electrical Systems Team', 'Embedded Systems Team'],
    deadline = 'Aug 14',
    cta = 'APPLY NOW →',
  } = data

  const roleList = typeof roles === 'string'
    ? roles.split('\n').map(r => r.trim()).filter(Boolean)
    : roles

  return (
    <div className="slide-root" style={{ background: BRAND.red, padding: 32, justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ background: '#fff', color: BRAND.red, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 3, letterSpacing: '0.08em' }}>
          {badge.toUpperCase()}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 500, letterSpacing: '0.06em', textAlign: 'right' }}>
          {BRAND.semester.toUpperCase()}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', fontWeight: 600 }}>{kicker.toUpperCase()}</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1.05, margin: '4px 0 10px' }}>
          {headline}
        </div>
        <div style={{ width: 32, height: 3, background: 'rgba(255,255,255,0.35)', borderRadius: 2, marginBottom: 14 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {roleList.map((role, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)' }}>{role}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
          Deadline: <span style={{ color: '#fff', fontWeight: 700 }}>{deadline}</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.15)', border: '0.5px solid rgba(255,255,255,0.35)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '7px 13px', borderRadius: 4, letterSpacing: '0.04em' }}>
          {cta}
        </div>
      </div>

      <div className="slide-brand" style={{ color: 'rgba(255,255,255,0.3)' }}>{BRAND.handle}</div>
    </div>
  )
}
