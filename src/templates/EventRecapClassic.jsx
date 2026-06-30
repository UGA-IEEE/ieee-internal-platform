import { BRAND } from '../constants/brand'
import { recapPageCount } from './EventRecapPost'

export { recapPageCount as recapClassicPageCount }

function photoUrls(images) {
  return Array.isArray(images) ? images.filter(Boolean) : []
}

export default function EventRecapClassic({ data, page = 0 }) {
  const {
    coverPhoto = '',
    eyebrow = 'EVENT RECAP',
    partner = 'Georgia Power',
    title = 'Site Visit Recap',
    date = 'March 13',
    recap = 'Thank you to everyone who joined us — and a huge thanks to our hosts for an unforgettable day.',
    images = [],
  } = data

  const photos = photoUrls(images)

  // ---- Cover slide ----
  if (page === 0) {
    return (
      <div className="slide-root" style={{ background: BRAND.red }}>
        {/* Optional full-bleed background photo */}
        {coverPhoto && (
          <img
            src={coverPhoto}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        {/* Scrim so white text stays readable over a photo */}
        {coverPhoto && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
        )}

        {/* Original text layout */}
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 36 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.85)' }}>
              {eyebrow.toUpperCase()}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginTop: 18 }}>
              {partner}
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.08, marginTop: 4 }}>
              {title}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginTop: 12 }}>
              {date}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.92)', lineHeight: 1.6, borderLeft: '2px solid rgba(255,255,255,0.5)', paddingLeft: 14 }}>
              {recap}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em' }}>
                {BRAND.orgName} · {BRAND.handle}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Swipe →</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---- Photo slide ----
  const photo = photos[page - 1]

  return (
    <div className="slide-root" style={{ background: BRAND.dark }}>
      {photo ? (
        <img
          src={photo}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 14 }}>
          Upload photos in the sidebar →
        </div>
      )}

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 110, background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }} />
      <div style={{ position: 'absolute', left: 24, bottom: 20, color: '#fff', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
        {partner} · {BRAND.handle}
      </div>
    </div>
  )
}
