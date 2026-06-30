import { useState, useRef, useEffect } from 'react'
import Sidebar from './Sidebar'
import Canvas from './Canvas'
import ExportBar from './ExportBar'
import { TEMPLATE_MAP } from '../../templates'
import { SIZES, DEFAULT_SIZE } from '../../constants/sizes'

export default function MediaGenApp() {
  const [selectedId, setSelectedId] = useState('event')
  const [formData, setFormData] = useState({})
  const [sizeId, setSizeId] = useState(TEMPLATE_MAP.event.defaultSize || DEFAULT_SIZE)
  const [logo, setLogo] = useState(null)
  const pageRefs = useRef([])

  // Lock body scroll while MediaGen is mounted; restore on unmount
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  function handleSelect(id) {
    setSelectedId(id)
    setFormData({})
    setSizeId(TEMPLATE_MAP[id]?.defaultSize || DEFAULT_SIZE)
  }

  const template = TEMPLATE_MAP[selectedId]
  const size = SIZES[sizeId] || SIZES[DEFAULT_SIZE]

  return (
    <div className="flex bg-gray-50 overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
      <Sidebar
        selected={selectedId}
        onSelect={handleSelect}
        formData={formData}
        onChange={setFormData}
        sizeId={sizeId}
        onSizeChange={setSizeId}
        logo={logo}
        onLogoChange={setLogo}
      />

      <main className="flex-1 overflow-auto">
        <div className="min-h-full flex flex-col items-center justify-center gap-5 p-8">
          {/* Template name header */}
          <div className="w-full max-w-[460px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{template?.icon}</span>
              <h1 className="text-lg font-bold text-gray-900">{template?.name}</h1>
            </div>
            <p className="text-xs text-gray-400">Edit fields in the sidebar — preview updates live</p>
          </div>

          <Canvas
            selectedId={selectedId}
            formData={formData}
            pageRefs={pageRefs}
            width={size.w}
            height={size.h}
            logo={logo}
          />

          <ExportBar
            pageRefs={pageRefs}
            templateName={template?.name || 'post'}
            width={size.w}
            height={size.h}
            scale={size.scale}
          />
        </div>
      </main>
    </div>
  )
}
