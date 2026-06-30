import { BRAND } from '../constants/brand'

// Cover slide (page 0) + one full-bleed photo per uploaded image.
// When no photos are uploaded yet, we still show one placeholder photo
// page so the carousel structure is visible in the preview.
function photoUrls(images) {
  return Array.isArray(images) ? images.filter(Boolean) : []
}

export function recapPageCount(data) {
  return 1 + Math.max(1, photoUrls(data.images).length)
}

export default function EventRecapPost({ data, page = 0 }) {
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
      <div className="slide-root" style={{ background: BRAND.dark }}>
        {/* Full-bleed cover photo or red fallback */}
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: BRAND.red }} />
        )}

        {/* Bottom white panel */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: BRAND.white, padding: '18px 28px 24px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: BRAND.red, marginBottom: 4 }}>
            {eyebrow.toUpperCase()}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 2 }}>
            {partner}
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: BRAND.dark, lineHeight: 1.1, marginBottom: 6 }}>
            {title}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 10 }}>{date}</div>
          <div style={{ fontSize: 12, color: '#555', lineHeight: 1.55, borderLeft: `2px solid ${BRAND.red}`, paddingLeft: 10, marginBottom: 14 }}>
            {recap}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#999', letterSpacing: '0.04em' }}>
              {BRAND.orgName} · {BRAND.handle}
            </span>
            <span style={{ fontSize: 11, color: '#bbb' }}>Swipe →</span>
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

      {/* Bottom gradient + handle for legibility over the photo */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 110, background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }} />
      <div style={{ position: 'absolute', left: 24, bottom: 20, color: '#fff', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
        {partner} · {BRAND.handle}
      </div>
    </div>
  )
}
