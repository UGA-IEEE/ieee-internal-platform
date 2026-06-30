import { useState } from 'react'
import { exportToPng } from '../../utils/exportPng'

export default function ExportBar({ pageRefs, templateName, width, height, scale }) {
  const [status, setStatus] = useState('idle') // idle | loading | done | error

  async function handleExport() {
    setStatus('loading')
    try {
      const slug = templateName.toLowerCase().replace(/\s+/g, '-')
      const date = new Date().toISOString().slice(0, 10)
      await exportToPng(pageRefs.current, `uga-ieee-${slug}-${date}`, { width, height, scale })
      setStatus('done')
      setTimeout(() => setStatus('idle'), 2500)
    } catch (e) {
      console.error(e)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const count = Math.max(1, pageRefs.current?.filter(Boolean).length || 1)
  const labels = {
    idle: count > 1 ? `↓ Download ${count} PNGs` : '↓ Download PNG',
    loading: 'Generating…',
    done: '✓ Saved!',
    error: 'Export failed — try again',
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-md">
      <button
        onClick={handleExport}
        disabled={status === 'loading'}
        className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all ${
          status === 'done'
            ? 'bg-green-500 text-white'
            : status === 'error'
            ? 'bg-red-100 text-red-700 border border-red-200'
            : 'bg-uga-red text-white hover:bg-red-800 active:scale-95'
        } disabled:opacity-60 disabled:cursor-wait`}
      >
        {labels[status]}
      </button>
      <p className="text-xs text-gray-400 text-center">
        File will be saved to your Downloads folder
      </p>
    </div>
  )
}
