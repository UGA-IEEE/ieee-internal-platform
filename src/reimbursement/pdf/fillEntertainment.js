import { PDFDocument } from 'pdf-lib';
import { getFont, drawText, wrapText } from './pdfUtils.js';

const C = {
  // Source of funding checkboxes (4 options, top to bottom)
  fund0: { x: 133, y: 648 }, // UGA Foundation
  fund1: { x: 133, y: 624 }, // UGARF Indirect
  fund2: { x: 133, y: 600 }, // Sponsored funds
  fund3: { x: 133, y: 572 }, // Royalty Revenue
  // Fields
  amount:   { x: 220, y: 492 },
  timePlace: [{ x: 220, y: 444 }, { x: 80, y: 428 }],
  purpose:   [{ x: 220, y: 420 }, { x: 80, y: 404 }],
  // Individuals table (12 rows, name col x=88, relationship col x=340)
  individuals: Array.from({ length: 12 }, (_, i) => ({
    name: { x: 88,  y: 356 - i * 18 },
    rel:  { x: 340, y: 356 - i * 18 },
  })),
};

export async function fillEntertainment(formData) {
  const pdfBytes = await fetch('/forms/entertainment.pdf').then(r => r.arrayBuffer());
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPages()[0];
  const font = await getFont(pdfDoc);
  const t = (text, coord) => drawText(page, text, coord.x, coord.y, font);

  // Source of funding checkbox
  const fundMap = { fund0: C.fund0, fund1: C.fund1, fund2: C.fund2, fund3: C.fund3 };
  (formData.fundingSources || []).forEach(key => {
    if (fundMap[key]) t('X', fundMap[key]);
  });

  t(formData.amount, C.amount);

  const tpLines = wrapText(formData.timePlace, 80);
  tpLines.slice(0, 2).forEach((l, i) => t(l, C.timePlace[i]));

  const purpLines = wrapText(formData.purpose, 80);
  purpLines.slice(0, 2).forEach((l, i) => t(l, C.purpose[i]));

  (formData.individuals || []).forEach((ind, i) => {
    if (i < C.individuals.length) {
      t(ind.name, C.individuals[i].name);
      t(ind.relationship, C.individuals[i].rel);
    }
  });

  return pdfDoc.save();
}
