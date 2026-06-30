import { BRAND } from '../constants/brand'

// Anchor presets for where the text block sits on top of the photo.
const POSITIONS = {
  'top-left': { justifyContent: 'flex-start', alignItems: 'flex-start', textAlign: 'left' },
  'top-center': { justifyContent: 'flex-start', alignItems: 'center', textAlign: 'center' },
  'top-right': { justifyContent: 'flex-start', alignItems: 'flex-end', textAlign: 'right' },
  'middle-left': { justifyContent: 'center', alignItems: 'flex-start', textAlign: 'left' },
  'middle-center': { justifyContent: 'center', alignItems: 'center', textAlign: 'center' },
  'middle-right': { justifyContent: 'center', alignItems: 'flex-end', textAlign: 'right' },
  'bottom-left': { justifyContent: 'flex-end', alignItems: 'flex-start', textAlign: 'left' },
  'bottom-center': { justifyContent: 'flex-end', alignItems: 'center', textAlign: 'center' },
  'bottom-right': { justifyContent: 'flex-end', alignItems: 'flex-end', textAlign: 'right' },
}

export default function PhotoOverlayPost({ data }) {
  const {
    image = '',
    text = 'Add your caption here',
    position = 'bottom-left',
  } = data

  const pos = POSITIONS[position] || POSITIONS['bottom-left']
  const isTop = position.startsWith('top')
  const isBottom = position.startsWith('bottom')

  return (
    <div className="slide-root" style={{ background: BRAND.dark }}>
      {image ? (
        <img
          src={image}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 14 }}>
          Upload a photo in the sidebar →
        </div>
      )}

      {/* Gradient scrim so the text stays legible over busy photos */}
      {isBottom && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
      )}
      {isTop && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '50%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }} />
      )}
      {!isTop && !isBottom && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
      )}

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: 32, ...pos }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.25,
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            textAlign: pos.textAlign,
            whiteSpace: 'pre-wrap',
          }}
        >
          {text}
        </div>
      </div>

      <div
        className="slide-brand"
        style={{ color: 'rgba(255,255,255,0.75)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
      >
        {BRAND.handle}
      </div>
    </div>
  )
}
