import { BRAND } from '../constants/brand'

export default function AppsOpenPost({ data }) {
  const {
    photo = '',
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
    <div className="slide-root" style={{ background: BRAND.dark }}>
      {/* Full-bleed background photo or red fallback */}
      {photo ? (
        <img
          src={photo}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: BRAND.red }} />
      )}

      {/* Badge overlay — top left */}
      <div style={{ position: 'absolute', top: 28, left: 28, background: BRAND.white, color: BRAND.red, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 3, letterSpacing: '0.08em' }}>
        {badge.toUpperCase()}
      </div>

      {/* Bottom white panel */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: BRAND.white, padding: '18px 28px 28px' }}>
        <div style={{ fontSize: 11, color: BRAND.red, letterSpacing: '0.1em', fontWeight: 600, marginBottom: 2 }}>{kicker.toUpperCase()}</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: BRAND.dark, lineHeight: 1.05, marginBottom: 8 }}>
          {headline}
        </div>
        <div style={{ width: 28, height: 3, background: BRAND.red, borderRadius: 2, marginBottom: 10 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
          {roleList.map((role, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: BRAND.red, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#444' }}>{role}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: '#888' }}>
            Deadline: <span style={{ color: BRAND.dark, fontWeight: 700 }}>{deadline}</span>
          </div>
          <div style={{ background: BRAND.red, color: '#fff', fontSize: 10, fontWeight: 700, padding: '7px 13px', borderRadius: 4, letterSpacing: '0.04em' }}>
            {cta}
          </div>
        </div>
        <div className="slide-brand" style={{ color: 'rgba(0,0,0,0.2)', bottom: 10, right: 24 }}>{BRAND.handle}</div>
      </div>
    </div>
  )
}
