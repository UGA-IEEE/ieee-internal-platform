import { PDFDocument } from 'pdf-lib';
import { getFont, drawText, embedSig } from './pdfUtils.js';

const C = {
  // Submitter info (org name & dept ID already printed on template)
  submitterName:  { x: 90,  y: 563 },
  submitterPhone: { x: 378, y: 563 },
  // Event details
  eventTitle:     { x: 130, y: 510 },
  location:       { x: 145, y: 489 },
  eventDate:      { x: 145, y: 469 },
  numAttendees:   { x: 380, y: 469 },
  numReceipts:    { x: 145, y: 449 },
  totalAmount:    { x: 380, y: 449 },
  foodAmount:     { x: 145, y: 429 },
  nonFoodAmount:  { x: 380, y: 429 },
  // Reimbursement details
  reimburseeName: { x: 145, y: 385 },
  reimEmail:      { x: 107, y: 362 },
  reimPhone:      { x: 357, y: 362 },
  street:         { x: 83,  y: 333 },
  city:           { x: 75,  y: 311 },
  zip:            { x: 328, y: 311 },
};

export async function fillStudentOrg(formData) {
  const pdfBytes = await fetch(`${import.meta.env.BASE_URL}forms/student-org-reimbursement.pdf`).then(r => r.arrayBuffer());
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPages()[0];
  const font = await getFont(pdfDoc);
  const t = (text, coord) => drawText(page, text, coord.x, coord.y, font);

  t(formData.submitterName,  C.submitterName);
  t(formData.submitterPhone, C.submitterPhone);
  t(formData.eventTitle,     C.eventTitle);
  t(formData.location,       C.location);
  t(formData.eventDate,      C.eventDate);
  t(formData.numAttendees,   C.numAttendees);
  t(formData.numReceipts,    C.numReceipts);
  t(formData.totalAmount,    C.totalAmount);
  t(formData.foodAmount,     C.foodAmount);
  t(formData.nonFoodAmount,  C.nonFoodAmount);
  t(formData.reimburseeName, C.reimburseeName);
  t(formData.reimEmail,      C.reimEmail);
  t(formData.reimPhone,      C.reimPhone);
  t(formData.street,         C.street);
  t(formData.city,           C.city);
  t(formData.zip,            C.zip);

  return pdfDoc.save();
}
