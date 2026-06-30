import { BRAND } from '../constants/brand'

const DEFAULT_EVENTS = [
  { date: 'Jan 30', name: 'Industry Night with Apollo MCE' },
  { date: 'Feb 14', name: 'E-Board Applications Due' },
  { date: 'Feb 27', name: 'Resume Workshop' },
  { date: 'Mar 13', name: 'Georgia Power Site Visit' },
  { date: 'Mar 27', name: 'PCB Design Workshop' },
  { date: 'Apr 10', name: 'End-of-Semester Banquet' },
]

// Events come in as "Date | Event name" — one per line.
function parseEvents(events) {
  if (Array.isArray(events)) return events
  if (typeof events === 'string') {
    return events
      .split('\n')
      .map(line => {
        const [date = '', name = ''] = line.split('|').map(s => s.trim())
        return { date, name }
      })
      .filter(e => e.date || e.name)
  }
  return DEFAULT_EVENTS
}

export default function SemesterCalendarPost({ data }) {
  const {
    semester = BRAND.semester,
    title = 'Semester Calendar',
    events = DEFAULT_EVENTS,
  } = data

  const eventList = parseEvents(events)

  return (
    // Defaults to "Letter" in the size picker (540 × 699 ≈ 8.5 × 11 → 1080 × 1398)
    <div className="slide-root" style={{ background: BRAND.white }}>
      {/* Header band */}
      <div style={{ background: BRAND.azure, padding: '36px 40px 28px', color: '#fff' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', opacity: 0.85 }}>
          {BRAND.orgName.toUpperCase()}
        </div>
        <div style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.1, marginTop: 8 }}>
          {title}
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, opacity: 0.9, marginTop: 6 }}>
          {semester}
        </div>
      </div>

      {/* Event list */}
      <div style={{ flex: 1, padding: '24px 40px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {eventList.map((e, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              padding: '14px 0',
              borderBottom: i < eventList.length - 1 ? '1px solid #e6eef4' : 'none',
            }}
          >
            <div
              style={{
                minWidth: 86,
                textAlign: 'center',
                background: '#eaf2f8',
                color: BRAND.azure,
                fontSize: 14,
                fontWeight: 700,
                padding: '8px 10px',
                borderRadius: 8,
                flexShrink: 0,
              }}
            >
              {e.date}
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, color: BRAND.dark, lineHeight: 1.25 }}>
              {e.name}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          background: BRAND.azure,
          color: '#fff',
          padding: '16px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.04em',
        }}
      >
        <span>{BRAND.handle}</span>
        <span>{BRAND.website}</span>
      </div>
    </div>
  )
}
