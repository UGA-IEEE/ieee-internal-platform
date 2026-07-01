import { rgb, StandardFonts } from 'pdf-lib';
import { supabase } from '../../lib/supabase.js';

export const BLACK = rgb(0, 0, 0);
export const FONT_SIZE = 9;
export const SIG_FONT_SIZE = 8;

export async function getFont(pdfDoc) {
  return pdfDoc.embedFont(StandardFonts.Helvetica);
}

export function drawText(page, text, x, y, font, size = FONT_SIZE) {
  if (!text) return;
  page.drawText(String(text), { x, y, size, font, color: BLACK });
}

// Signature images live in a private Supabase Storage bucket (not the public/
// folder) so they're never committed to this public git repo. Access is
// gated by the "signatures" bucket's admin-only RLS policy — see
// supabase/migration_add_signatures_bucket.sql.
export async function getSignatureUrl(sigFile) {
  if (!sigFile) return null;
  const { data, error } = await supabase.storage.from('signatures').createSignedUrl(sigFile, 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function embedSig(pdfDoc, page, sigFile, x, y, width, height) {
  if (!sigFile) return;
  try {
    const signedUrl = await getSignatureUrl(sigFile);
    const res = await fetch(signedUrl);
    const bytes = await res.arrayBuffer();
    const img = await pdfDoc.embedPng(bytes);
    page.drawImage(img, { x, y, width, height });
  } catch (e) {
    console.warn('Could not embed signature:', sigFile, e);
  }
}

export function wrapText(text, maxChars) {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function downloadPdf(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function makeBlobUrl(bytes) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}
