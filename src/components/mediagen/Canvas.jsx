import { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react'
import { TEMPLATE_MAP } from '../../templates'

// Normalize string form fields back into the arrays some templates expect.
function parseData(template, formData) {
  const data = { ...template.defaultData, ...formData }

  if (typeof data.skills === 'string') {
    data.skills = data.skills.split(',').map(s => s.trim()).filter(Boolean)
  }
  if (typeof data.roles === 'string') {
    data.roles = data.roles.split('\n').map(s => s.trim()).filter(Boolean)
  }
  if (typeof data.members === 'string') {
    data.members = data.members.split('\n').map(line => {
      const [name = '', role = ''] = line.split(',').map(s => s.trim())
      return { name, role, initials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() }
    }).filter(m => m.name)
  }

  return data
}

// One fully-rendered slide at native design size, with the optional logo overlay.
// Sizing is driven by CSS variables so .slide-root (and the wrapper) resize together.
function Slide({ template, data, page, width, height, logo, innerRef, style }) {
  const TemplateComponent = template.component
  return (
    <div
      ref={innerRef}
      style={{
        position: 'relative',
        width,
        height,
        '--slide-w': `${width}px`,
        '--slide-h': `${height}px`,
        ...style,
      }}
    >
      <TemplateComponent data={data} page={page} />
      {logo && (
        <div
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'rgba(255,255,255,0.92)',
            borderRadius: 8,
            padding: 6,
            display: 'flex',
            boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
            zIndex: 5,
          }}
        >
          <img src={logo} alt="" style={{ maxWidth: 90, maxHeight: 44, objectFit: 'contain', display: 'block' }} />
        </div>
      )}
    </div>
  )
}

export default function Canvas({ selectedId, formData, pageRefs, width, height, logo }) {
  const containerRef = useRef(null)
  const previewRef = useRef(null)
  const slideEls = useRef([])
  const [page, setPage] = useState(0)
  const template = TEMPLATE_MAP[selectedId]

  const data = template ? parseData(template, formData) : {}
  const pageCount = template?.pageCount ? Math.max(1, template.pageCount(data)) : 1
  const currentPage = Math.min(page, pageCount - 1)

  // Reset to the first page whenever the template changes.
  useEffect(() => { setPage(0) }, [selectedId])

  // Publish the collected slide nodes to the caller-owned pageRefs only after
  // a render has actually committed (refs attach during commit, so reading
  // slideEls here is always in sync — an in-progress/discarded render never
  // gets here, unlike mutating pageRefs.current directly in the render body).
  useLayoutEffect(() => {
    pageRefs.current = slideEls.current.slice(0, pageCount)
  })

  // Scale the preview down to fit its container (export render stays full-size).
  const scalePreview = useCallback(() => {
    if (containerRef.current && previewRef.current) {
      const w = containerRef.current.offsetWidth
      previewRef.current.style.transform = `scale(${w / width})`
    }
  }, [width])

  useEffect(() => {
    scalePreview()
    const ro = new ResizeObserver(scalePreview)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [scalePreview, height])

  if (!template) return null

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Scaled preview of the current page — capped so tall sizes still fit */}
      <div
        ref={containerRef}
        className="rounded-xl overflow-hidden shadow-2xl"
        style={{
          width: `min(100%, calc(68vh * ${width} / ${height}))`,
          maxWidth: 460,
          aspectRatio: `${width}/${height}`,
          position: 'relative',
        }}
      >
        <Slide
          template={template}
          data={data}
          page={currentPage}
          width={width}
          height={height}
          logo={logo}
          innerRef={previewRef}
          style={{ position: 'absolute', top: 0, left: 0, transformOrigin: 'top left' }}
        />
      </div>

      {/* Page navigation for multi-page posts */}
      {pageCount > 1 && (
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30"
          >
            ‹ Prev
          </button>
          <span className="tabular-nums">{currentPage + 1} / {pageCount}</span>
          <button
            onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
            disabled={currentPage === pageCount - 1}
            className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30"
          >
            Next ›
          </button>
        </div>
      )}

      {/* Hidden full-size render — one node per page, captured on export */}
      <div style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }} aria-hidden>
        {Array.from({ length: pageCount }).map((_, i) => (
          <Slide
            key={i}
            template={template}
            data={data}
            page={i}
            width={width}
            height={height}
            logo={logo}
            innerRef={el => { slideEls.current[i] = el }}
          />
        ))}
      </div>
    </div>
  )
}
