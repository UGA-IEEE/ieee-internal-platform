import { PDFDocument } from 'pdf-lib';
import { getFont, drawText, embedSig } from './pdfUtils.js';

const C = {
  travelerName:   { x: 100, y: 700 },
  travelerEmail:  { x: 310, y: 700 },
  travelerPhone:  { x: 490, y: 700 },
  mailingAddress: { x: 100, y: 682 },
  country:        { x: 490, y: 682 },
  departLoc:      { x: 100, y: 664 },
  departCountry:  { x: 490, y: 664 },
  finalDest:      { x: 100, y: 646 },
  destCountry:    { x: 490, y: 646 },
  departDate:     { x: 100, y: 628 },
  returnDate:     { x: 300, y: 628 },
  primaryPurpose: { x: 100, y: 610 },
  justification:  { x: 100, y: 592 },
  deptContact:    { x: 100, y: 574 },
  contactEmail:   { x: 100, y: 556 },
  contactPhone:   { x: 310, y: 556 },
  // Expense estimates
  meals:         { x: 480, y: 490 },
  lodging:       { x: 480, y: 472 },
  transportation:{ x: 480, y: 454 },
  other:         { x: 480, y: 436 },
  total:         { x: 480, y: 416 },
  // Yes/No — international travel
  intlYes: { x: 524, y: 390 }, intlNo: { x: 556, y: 390 },
  cubaYes:  { x: 524, y: 365 }, cubaNo:  { x: 556, y: 365 },
  exportYes:{ x: 524, y: 340 }, exportNo: { x: 556, y: 340 },
  // Signatures
  travelerSig:   { x: 90,  y: 130, w: 110, h: 28 },
  travelerDate:  { x: 280, y: 130 },
  deptHeadSig:   { x: 340, y: 130, w: 110, h: 28 },
  deptHeadDate:  { x: 540, y: 130 },
  // Financial codes
  speedtype:     { x: 145, y: 100 },
  accountCode:   { x: 280, y: 100 },
  amount:        { x: 90,  y: 100 },
};

export async function fillTravelAuth(formData) {
  const pdfBytes = await fetch(`${import.meta.env.BASE_URL}forms/travel-authorization.pdf`).then(r => r.arrayBuffer());
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPages()[0];
  const font = await getFont(pdfDoc);
  const t = (text, coord) => drawText(page, text, coord.x, coord.y, font);
  const yn = (val, yC, nC) => t('X', val ? yC : nC);

  t(formData.travelerName,    C.travelerName);
  t(formData.travelerEmail,   C.travelerEmail);
  t(formData.travelerPhone,   C.travelerPhone);
  t(formData.mailingAddress,  C.mailingAddress);
  t(formData.country || 'USA', C.country);
  t(formData.departLoc,       C.departLoc);
  t('USA',                    C.departCountry);
  t(formData.finalDest,       C.finalDest);
  t('USA',                    C.destCountry);
  t(formData.departDate,      C.departDate);
  t(formData.returnDate,      C.returnDate);
  t(formData.primaryPurpose,  C.primaryPurpose);
  t(formData.justification,   C.justification);
  t(formData.deptContact,     C.deptContact);
  t(formData.contactEmail,    C.contactEmail);
  t(formData.contactPhone,    C.contactPhone);
  t(formData.meals,           C.meals);
  t(formData.lodging,         C.lodging);
  t(formData.transportation,  C.transportation);
  t(formData.other,           C.other);
  t(formData.total,           C.total);
  t(formData.speedtype,       C.speedtype);
  t(formData.accountCode,     C.accountCode);
  t(formData.amount,          C.amount);

  yn(formData.internationalTravel, C.intlYes,  C.intlNo);
  yn(formData.restrictedCountry,   C.cubaYes,  C.cubaNo);
  yn(formData.exportControlled,    C.exportYes, C.exportNo);

  t(formData.travelerDate,  C.travelerDate);
  t(formData.deptHeadDate,  C.deptHeadDate);

  await embedSig(pdfDoc, page, formData.travelerSig,  C.travelerSig.x,  C.travelerSig.y,  C.travelerSig.w,  C.travelerSig.h);
  await embedSig(pdfDoc, page, formData.deptHeadSig,  C.deptHeadSig.x,  C.deptHeadSig.y,  C.deptHeadSig.w,  C.deptHeadSig.h);

  return pdfDoc.save();
}
