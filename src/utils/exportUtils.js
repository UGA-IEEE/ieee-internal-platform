import ExcelJS from 'exceljs'

export async function exportApplicationsToExcel(applications, memberName = '') {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Applications')

  sheet.columns = [
    { header: 'App #',          key: 'app_number',     width: 8  },
    { header: 'Date Applied',   key: 'date_applied',   width: 14 },
    { header: 'Company',        key: 'company',        width: 22 },
    { header: 'Position',       key: 'position_name',  width: 28 },
    { header: 'Reference Link', key: 'reference_link', width: 40 },
    { header: 'Location',       key: 'location',       width: 20 },
    { header: 'Pay',            key: 'pay',            width: 14 },
    { header: 'Status',         key: 'status',         width: 12 },
  ]

  // Style header row
  sheet.getRow(1).eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00629B' } }
    cell.alignment = { vertical: 'middle' }
  })
  sheet.getRow(1).height = 20

  applications.forEach(app => {
    sheet.addRow({
      app_number:     app.app_number,
      date_applied:   app.date_applied,
      company:        app.company,
      position_name:  app.position_name,
      reference_link: app.reference_link ?? '',
      location:       app.location ?? '',
      pay:            app.pay ?? '',
      status:         app.status,
    })
  })

  // Write to buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = memberName
    ? `${memberName.replace(/\s+/g, '_')}_applications.xlsx`
    : 'applications.xlsx'
  a.click()
  URL.revokeObjectURL(url)
}

export const STATUS_OPTIONS = ['applied', 'interview', 'offered', 'rejected', 'accepted']

// Header text (as written by exportApplicationsToExcel) → DB column
const IMPORT_HEADERS = {
  'app #':          'app_number',
  'date applied':   'date_applied',
  'company':        'company',
  'position':       'position_name',
  'reference link': 'reference_link',
  'location':       'location',
  'pay':            'pay',
  'status':         'status',
}
const REQUIRED_COLUMNS = { date_applied: 'Date Applied', company: 'Company', position_name: 'Position' }

// Flattens the different shapes ExcelJS uses for a cell value
// (hyperlinks, rich text, formulas) down to a plain string or Date.
function cellToPlain(value) {
  if (value == null) return ''
  if (value instanceof Date) return value
  if (typeof value === 'object') {
    if (value.hyperlink) return value.hyperlink
    if (value.richText) return value.richText.map(r => r.text).join('')
    if ('result' in value) return cellToPlain(value.result)
    if ('text' in value) return cellToPlain(value.text)
    return ''
  }
  return String(value).trim()
}

function pad(n) {
  return String(n).padStart(2, '0')
}

// Accepts a Date cell, an ISO string (2026-09-14), or a US-style
// string (9/14/2026); returns 'yyyy-MM-dd' or null.
function toIsoDate(value) {
  if (value instanceof Date) {
    // Excel dates carry no timezone; ExcelJS gives them back as UTC midnight.
    return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`
  }
  const s = String(value).trim()
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/)
  if (m) {
    const year = m[3].length === 2 ? `20${m[3]}` : m[3]
    return `${year}-${pad(m[1])}-${pad(m[2])}`
  }
  return null
}

export function applicationKey(app) {
  return [app.date_applied, app.company, app.position_name]
    .map(v => String(v ?? '').trim().toLowerCase())
    .join('|')
}

// Reads a workbook laid out like the one exportApplicationsToExcel produces.
// Returns { rows, errors } where rows are ready to insert (minus user_id)
// and errors are { row, message } for rows that couldn't be used.
export async function parseApplicationsFromExcel(file) {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())
  const sheet = workbook.getWorksheet('Applications') ?? workbook.worksheets[0]
  if (!sheet) throw new Error('The file has no worksheets.')

  const columnMap = {}
  sheet.getRow(1).eachCell((cell, col) => {
    const key = IMPORT_HEADERS[String(cellToPlain(cell.value)).toLowerCase()]
    if (key) columnMap[key] = col
  })
  const missing = Object.entries(REQUIRED_COLUMNS)
    .filter(([key]) => !columnMap[key])
    .map(([, label]) => `"${label}"`)
  if (missing.length) {
    throw new Error(`Missing column(s): ${missing.join(', ')}. Use the same layout as "Export to Excel".`)
  }

  const rows = []
  const errors = []
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const get = key => columnMap[key] ? cellToPlain(row.getCell(columnMap[key]).value) : ''

    const company = String(get('company'))
    const position = String(get('position_name'))
    const rawDate = get('date_applied')
    if (!company && !position && !rawDate) return // blank row

    const date = toIsoDate(rawDate)
    const status = String(get('status')).toLowerCase() || 'applied'
    const problems = []
    if (!company) problems.push('missing Company')
    if (!position) problems.push('missing Position')
    if (!date) problems.push(rawDate ? `unreadable date "${rawDate}"` : 'missing Date Applied')
    if (!STATUS_OPTIONS.includes(status)) problems.push(`unknown status "${status}"`)
    if (problems.length) {
      errors.push({ row: rowNumber, message: problems.join(', ') })
      return
    }

    rows.push({
      source_row:     rowNumber,
      source_number:  Number(get('app_number')) || null,
      date_applied:   date,
      company,
      position_name:  position,
      reference_link: String(get('reference_link')) || null,
      location:       String(get('location')) || null,
      pay:            String(get('pay')) || null,
      status,
    })
  })

  // Oldest first so the DB trigger hands out App #s in chronological order
  // (exports are newest-first).
  rows.sort((a, b) =>
    a.date_applied.localeCompare(b.date_applied) ||
    (a.source_number ?? Infinity) - (b.source_number ?? Infinity) ||
    a.source_row - b.source_row
  )

  return { rows, errors }
}
