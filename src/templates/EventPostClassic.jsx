import { BRAND } from '../constants/brand'

export default function EventPostClassic({ data }) {
  const {
    icon = ' ',
    eyebrow = 'EVENT',
    title = 'Event Title',
    date = 'Date TBD',
    time = 'Time TBD',
    location = 'Location TBD',
  } = data

  return (
    <div className="slide-root" style={{ background: BRAND.red }}>
      {/* Top icon zone */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '32px 32px 20px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 70, height: '100%', background: 'rgba(0,0,0,0.12)' }} />
        <div style={{ position: 'absolute', top: 0, right: 24, width: 22, height: '100%', background: 'rgba(0,0,0,0.08)' }} />
        <div style={{ fontSize: 80, zIndex: 1 }}>{icon}</div>
      </div>

      {/* Bottom white panel */}
      <div style={{ background: BRAND.white, padding: '20px 28px 28px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: BRAND.red, marginBottom: 5 }}>
          {eyebrow.toUpperCase()}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: BRAND.dark, lineHeight: 1.15, marginBottom: 12 }}>
          {title}
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#555' }}>
            📅 {date}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#555' }}>
            🕐 {time}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#555' }}>
            📍 {location}
          </div>
        </div>
        <div className="slide-brand" style={{ color: BRAND.red, bottom: 20, right: 24 }}>
          {BRAND.handle}
        </div>
      </div>
    </div>
  )
}
