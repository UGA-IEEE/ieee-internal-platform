// Output size presets. `w`/`h` are design pixels; export multiplies by `scale`.
// e.g. portrait 540×675 × 2 = 1080×1350.
export const SIZES = {
  portrait:  { id: 'portrait',  label: 'Portrait 4:5 (1080×1350)',     w: 540, h: 675, scale: 2 },
  square:    { id: 'square',    label: 'Square 1:1 (1080×1080)',       w: 540, h: 540, scale: 2 },
  story:     { id: 'story',     label: 'Story / Reel 9:16 (1080×1920)', w: 540, h: 960, scale: 2 },
  landscape: { id: 'landscape', label: 'Landscape 1.91:1 (1080×566)',  w: 540, h: 283, scale: 2 },
  letter:    { id: 'letter',    label: 'Letter 8.5×11 (1080×1398)',    w: 540, h: 699, scale: 2 },
}

export const DEFAULT_SIZE = 'portrait'

export const SIZE_LIST = Object.values(SIZES)
