import html2canvas from 'html2canvas'

/**
 * Capture a single full-size DOM element to a PNG and trigger a download.
 *
 * @param {HTMLElement} el - element rendered at its native design size
 * @param {string} filename - download filename (no extension)
 * @param {{ width: number, height: number, scale: number }} dims
 */
async function captureElement(el, filename, { width, height, scale }) {
  const canvas = await html2canvas(el, {
    scale,
    width,
    height,
    useCORS: true,
    logging: false,
    backgroundColor: null,
  })

  const link = document.createElement('a')
  link.download = `${filename}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

/**
 * Exports one or more slides to PNG.
 *
 * Each element must be rendered at its native design size (no display transform).
 * A single-page post downloads `filename.png`; a multi-page post downloads
 * `filename-1.png`, `filename-2.png`, … one file per page.
 *
 * @param {HTMLElement[]} els - the full-size slide elements, in page order
 * @param {string} filename - base download filename (no extension)
 * @param {object} [opts]
 * @param {number} [opts.width=540] - design width in px
 * @param {number} [opts.height=675] - design height in px (4:5 portrait default)
 * @param {number} [opts.scale=2] - export multiplier (540 × 2 = 1080)
 */
export async function exportToPng(els, filename = 'ieee-post', opts = {}) {
  const { width = 540, height = 675, scale = 2 } = opts
  const pages = (Array.isArray(els) ? els : [els]).filter(Boolean)
  if (pages.length === 0) throw new Error('No slides to export')

  for (let i = 0; i < pages.length; i++) {
    const name = pages.length > 1 ? `${filename}-${i + 1}` : filename
    await captureElement(pages[i], name, { width, height, scale })
    // Small gap so browsers don't drop back-to-back downloads
    if (pages.length > 1) await new Promise(r => setTimeout(r, 200))
  }
}
