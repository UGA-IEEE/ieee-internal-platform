import { TEMPLATES } from '../../templates'
import { SIZE_LIST } from '../../constants/sizes'

const CATEGORIES = [...new Set(TEMPLATES.map(t => t.category))]

function readFilesAsDataUrls(fileList) {
  return Promise.all(
    Array.from(fileList).map(
      file =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
    )
  )
}

export default function Sidebar({ selected, onSelect, formData, onChange, sizeId, onSizeChange, logo, onLogoChange }) {
  const template = TEMPLATES.find(t => t.id === selected)

  return (
    <aside className="w-72 h-full bg-white border-r border-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-uga-red flex items-center justify-center text-white text-xs font-bold">⚡</div>
          <div>
            <div className="text-sm font-bold text-gray-900">IEEE MediaGen</div>
            <div className="text-xs text-gray-400">UGA IEEE</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Template picker */}
        <div className="px-4 pt-4 pb-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Templates</div>
          {CATEGORIES.map(cat => (
            <div key={cat} className="mb-3">
              <div className="text-xs text-gray-300 font-medium mb-1 px-1">{cat}</div>
              {TEMPLATES.filter(t => t.category === cat).map(t => (
                <button
                  key={t.id}
                  onClick={() => onSelect(t.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 mb-0.5 transition-colors ${
                    selected === t.id
                      ? 'bg-red-50 text-uga-red font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">{t.icon}</span>
                  {t.name}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Output settings — size + logo, shared across all templates */}
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Output</div>

          <label className="block text-xs font-medium text-gray-500 mb-1">Size</label>
          <select
            value={sizeId}
            onChange={e => onSizeChange(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-3 bg-white focus:outline-none focus:border-uga-red focus:ring-1 focus:ring-uga-red text-gray-800"
          >
            {SIZE_LIST.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>

          <label className="block text-xs font-medium text-gray-500 mb-1">Logo / image (all templates)</label>
          <input
            type="file"
            accept="image/*"
            onChange={async e => {
              if (!e.target.files?.length) return
              const [url] = await readFilesAsDataUrls(e.target.files)
              onLogoChange(url)
              e.target.value = ''
            }}
            className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-uga-red hover:file:bg-red-100"
          />
          {logo && (
            <div className="flex items-center gap-2 mt-1.5">
              <img src={logo} alt="" className="h-6 w-auto max-w-[60px] object-contain border border-gray-100 rounded" />
              <button type="button" onClick={() => onLogoChange(null)} className="text-xs text-uga-red hover:underline">
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Dynamic form */}
        {template && (
          <div className="px-4 pb-6 border-t border-gray-100 pt-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Content</div>
            <div className="flex flex-col gap-3">
              {template.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                  {field.type === 'image' ? (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async e => {
                          if (!e.target.files?.length) return
                          const [url] = await readFilesAsDataUrls(e.target.files)
                          onChange({ ...formData, [field.key]: url })
                          e.target.value = ''
                        }}
                        className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-uga-red hover:file:bg-red-100"
                      />
                      {(() => {
                        const img = formData[field.key] ?? template.defaultData[field.key] ?? ''
                        return img ? (
                          <div className="flex items-center gap-2 mt-1.5">
                            <img src={img} alt="" className="h-10 w-14 object-cover rounded border border-gray-100" />
                            <button
                              type="button"
                              onClick={() => onChange({ ...formData, [field.key]: '' })}
                              className="text-xs text-uga-red hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ) : null
                      })()}
                    </div>
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.key] ?? (template.defaultData[field.key] ?? '')}
                      onChange={e => onChange({ ...formData, [field.key]: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-uga-red focus:ring-1 focus:ring-uga-red text-gray-800"
                    >
                      {field.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'images' ? (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={async e => {
                          const urls = await readFilesAsDataUrls(e.target.files)
                          const existing = formData[field.key] ?? template.defaultData[field.key] ?? []
                          onChange({ ...formData, [field.key]: [...existing, ...urls] })
                          e.target.value = ''
                        }}
                        className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-uga-red hover:file:bg-red-100"
                      />
                      {(() => {
                        const imgs = formData[field.key] ?? template.defaultData[field.key] ?? []
                        return imgs.length > 0 ? (
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-xs text-gray-400">{imgs.length} photo{imgs.length > 1 ? 's' : ''} added</span>
                            <button
                              type="button"
                              onClick={() => onChange({ ...formData, [field.key]: [] })}
                              className="text-xs text-uga-red hover:underline"
                            >
                              Clear
                            </button>
                          </div>
                        ) : null
                      })()}
                    </div>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      placeholder={field.placeholder}
                      value={formData[field.key] ?? (Array.isArray(template.defaultData[field.key]) ? template.defaultData[field.key].join('\n') : template.defaultData[field.key] ?? '')}
                      onChange={e => onChange({ ...formData, [field.key]: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-uga-red focus:ring-1 focus:ring-uga-red text-gray-800 placeholder-gray-300"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={formData[field.key] ?? (template.defaultData[field.key] ?? '')}
                      onChange={e => onChange({ ...formData, [field.key]: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-uga-red focus:ring-1 focus:ring-uga-red text-gray-800 placeholder-gray-300"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
