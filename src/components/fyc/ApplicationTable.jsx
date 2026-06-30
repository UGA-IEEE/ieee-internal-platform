import { useState } from 'react'
import { Pencil, Trash2, ExternalLink, Download, ChevronUp, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { exportApplicationsToExcel } from '../../utils/exportUtils'
import { useAuth } from '../../contexts/AuthContext'

const STATUS_STYLES = {
  applied:   'bg-blue-100 text-blue-800',
  interview: 'bg-yellow-100 text-yellow-800',
  offered:   'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
  accepted:  'bg-emerald-100 text-emerald-800',
}

function SortIcon({ column, sortBy, sortDir }) {
  if (sortBy !== column) return <ChevronUp size={14} className="text-gray-300" />
  return sortDir === 'asc'
    ? <ChevronUp size={14} className="text-ieee-blue" />
    : <ChevronDown size={14} className="text-ieee-blue" />
}

export function ApplicationTable({ applications, onEdit, onDeleted, readOnly = false }) {
  const { profile } = useAuth()
  const [sortBy, setSortBy] = useState('date_applied')
  const [sortDir, setSortDir] = useState('desc')

  function toggleSort(col) {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(col)
      setSortDir('desc')
    }
  }

  const sorted = [...applications].sort((a, b) => {
    const av = a[sortBy] ?? ''
    const bv = b[sortBy] ?? ''
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
    return sortDir === 'asc' ? cmp : -cmp
  })

  async function handleDelete(id) {
    if (!window.confirm('Delete this application? This cannot be undone.')) return
    const { error } = await supabase.from('applications').delete().eq('id', id)
    if (!error) onDeleted(id)
  }

  const columns = [
    { key: 'app_number', label: '#', sortable: true },
    { key: 'date_applied', label: 'Date Applied', sortable: true },
    { key: 'company', label: 'Company', sortable: true },
    { key: 'position_name', label: 'Position', sortable: true },
    { key: 'reference_link', label: 'Link', sortable: false },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'pay', label: 'Pay', sortable: false },
    { key: 'status', label: 'Status', sortable: true },
  ]

  if (!readOnly) columns.push({ key: '_actions', label: '', sortable: false })

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">
          {applications.length} application{applications.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => exportApplicationsToExcel(applications, profile?.full_name)}
          className="flex items-center gap-1.5 text-sm text-ieee-blue hover:text-ieee-blue-dark font-medium transition-colors"
          // exportApplicationsToExcel is async; browser download is triggered inside
        >
          <Download size={15} />
          Export to Excel
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-medium whitespace-nowrap select-none ${col.sortable ? 'cursor-pointer hover:text-ieee-blue' : ''}`}
                  onClick={() => col.sortable && toggleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon column={col.key} sortBy={sortBy} sortDir={sortDir} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-gray-400">
                  No applications yet. Add your first one!
                </td>
              </tr>
            ) : (
              sorted.map(app => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 font-mono">{app.app_number}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{app.date_applied}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{app.company}</td>
                  <td className="px-4 py-3 text-gray-700">{app.position_name}</td>
                  <td className="px-4 py-3">
                    {app.reference_link ? (
                      <a
                        href={app.reference_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-ieee-blue hover:underline"
                      >
                        <ExternalLink size={13} />
                        Link
                      </a>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{app.location ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 text-gray-600">{app.pay ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[app.status]}`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </td>
                  {!readOnly && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(app)}
                          className="text-gray-400 hover:text-ieee-blue transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
