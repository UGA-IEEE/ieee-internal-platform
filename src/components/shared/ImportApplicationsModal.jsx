import { useState, useEffect, useRef } from 'react'
import { X, Upload, FileSpreadsheet } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { parseApplicationsFromExcel, applicationKey } from '../../utils/exportUtils'

export function ImportApplicationsModal({ existing, onClose, onImported, table = 'applications' }) {
  const { user } = useAuth()
  const fileInput = useRef(null)
  const [fileName, setFileName] = useState('')
  const [parsed, setParsed] = useState(null) // { toImport, duplicates, errors }
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file
    if (!file) return
    setFileName(file.name)
    setParsed(null)
    setError('')
    setParsing(true)
    try {
      const { rows, errors } = await parseApplicationsFromExcel(file)
      // Skip anything already in the tracker (and repeats within the file)
      // so re-importing an updated sheet only adds the new rows.
      const seen = new Set(existing.map(applicationKey))
      const toImport = []
      let duplicates = 0
      for (const row of rows) {
        const key = applicationKey(row)
        if (seen.has(key)) { duplicates++; continue }
        seen.add(key)
        toImport.push(row)
      }
      setParsed({ toImport, duplicates, errors })
    } catch (err) {
      setError(err.message ?? 'Could not read that file.')
    } finally {
      setParsing(false)
    }
  }

  async function handleImport() {
    setError('')
    setSaving(true)
    try {
      const payload = parsed.toImport.map(({ source_row, source_number, ...app }) => ({
        ...app,
        user_id: user.id,
      }))
      const { data, error } = await supabase.from(table).insert(payload).select()
      if (error) throw error
      onImported(data)
    } catch (err) {
      setError(err.message ?? 'Failed to import applications.')
    } finally {
      setSaving(false)
    }
  }

  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape' && !saving) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, saving])

  const count = parsed?.toImport.length ?? 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Import from Excel</h2>
          <button onClick={onClose} disabled={saving} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Upload an <span className="font-medium">.xlsx</span> file with the same columns as
            "Export to Excel" (Date Applied, Company, Position, Reference Link, Location, Pay, Status).
            App # is assigned automatically, and rows already in your tracker are skipped.
          </p>

          <input
            ref={fileInput}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={parsing || saving}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-ieee-blue text-gray-600 hover:text-ieee-blue rounded-xl py-6 transition-colors disabled:opacity-60"
          >
            {fileName ? <FileSpreadsheet size={18} /> : <Upload size={18} />}
            <span className="text-sm font-medium">
              {parsing ? 'Reading…' : fileName || 'Choose a spreadsheet'}
            </span>
          </button>

          {parsed && (
            <div className="text-sm space-y-2">
              <p className="text-gray-800">
                <span className="font-semibold">{count}</span> new application{count !== 1 ? 's' : ''} to import
              </p>
              {parsed.duplicates > 0 && (
                <p className="text-gray-500">
                  {parsed.duplicates} already in your tracker (same date, company and position) — skipped
                </p>
              )}
              {parsed.errors.length > 0 && (
                <div className="text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <p className="font-medium mb-1">
                    {parsed.errors.length} row{parsed.errors.length !== 1 ? 's' : ''} skipped:
                  </p>
                  <ul className="list-disc pl-5 space-y-0.5 max-h-32 overflow-y-auto">
                    {parsed.errors.map(e => (
                      <li key={e.row}>Row {e.row}: {e.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={!count || saving}
              className="flex-1 bg-ieee-blue hover:bg-ieee-blue-dark text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {saving ? 'Importing…' : `Import ${count || ''}`.trim()}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
