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
