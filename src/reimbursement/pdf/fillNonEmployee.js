import { PDFDocument } from 'pdf-lib';
import { getFont, drawText, embedSig } from './pdfUtils.js';

const C = {
  payeeName:    { x: 120, y: 692 },
  payeeAddress: { x: 120, y: 672 },
  vendorNum:    { x: 255, y: 650 },
  // Yes/No boxes: draw X in the correct box
  // Q4 US Citizen
  q4Yes: { x: 322, y: 630 }, q4No: { x: 356, y: 630 },
  // Q5 fee for services
  q5Yes: { x: 433, y: 610 }, q5No: { x: 467, y: 610 },
  // Q6 UGA student
  q6Yes: { x: 300, y: 590 }, q6No: { x: 334, y: 590 },
  // Q7 employed by UGA last 24 months
  q7Yes: { x: 338, y: 570 }, q7No: { x: 372, y: 570 },
  businessPurpose: { x: 120, y: 548 },
  // Payment for services
  serviceAmt:     { x: 480, y: 495 },
  serviceDates:   { x: 160, y: 475 },
  serviceDesc:    { x: 160, y: 455 },
  // Travel reimbursement
  travelDates:    { x: 160, y: 430 },
  miles:          { x: 83,  y: 412 },
  mileageRate:    { x: 125, y: 412 },
  mileageTotal:   { x: 480, y: 412 },
  perDiemDays:    { x: 83,  y: 394 },
  perDiemTotal:   { x: 480, y: 394 },
  firstDayPerDiem:  { x: 480, y: 375 },
  lastDayPerDiem:   { x: 480, y: 357 },
  otherExpenses:    { x: 480, y: 338 },
  grandTotal:       { x: 480, y: 295 },
  // Signatures
  payeeSig:    { x: 120, y: 260, w: 110, h: 28 },
  payeeDate:   { x: 430, y: 260 },
  approvalSig: { x: 120, y: 215, w: 110, h: 28 },
  approvalDate:{ x: 430, y: 215 },
};

export async function fillNonEmployee(formData) {
  const pdfBytes = await fetch(`${import.meta.env.BASE_URL}forms/non-employee-payment.pdf`).then(r => r.arrayBuffer());
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPages()[0];
  const font = await getFont(pdfDoc);
  const t = (text, coord) => drawText(page, text, coord.x, coord.y, font);
  const yn = (val, yCoord, nCoord) => t('X', val ? yCoord : nCoord);

  t(formData.payeeName,    C.payeeName);
  t(formData.payeeAddress, C.payeeAddress);
  t(formData.vendorNum,    C.vendorNum);

  yn(formData.usCitizen,         C.q4Yes, C.q4No);
  yn(formData.feeForServices,    C.q5Yes, C.q5No);
  yn(formData.ugaStudent,        C.q6Yes, C.q6No);
  yn(formData.employedByUga,     C.q7Yes, C.q7No);

  t(formData.businessPurpose, C.businessPurpose);

  if (formData.serviceAmt)   t(formData.serviceAmt,   C.serviceAmt);
  if (formData.serviceDates) t(formData.serviceDates, C.serviceDates);
  if (formData.serviceDesc)  t(formData.serviceDesc,  C.serviceDesc);
  if (formData.travelDates)  t(formData.travelDates,  C.travelDates);
  if (formData.miles)        t(formData.miles,         C.miles);
  if (formData.mileageRate)  t(formData.mileageRate,  C.mileageRate);
  if (formData.mileageTotal) t(formData.mileageTotal, C.mileageTotal);
  if (formData.perDiemDays)  t(formData.perDiemDays,  C.perDiemDays);
  if (formData.perDiemTotal) t(formData.perDiemTotal, C.perDiemTotal);
  if (formData.otherExpenses)t(formData.otherExpenses,C.otherExpenses);
  if (formData.grandTotal)   t(formData.grandTotal,   C.grandTotal);

  t(formData.payeeDate,    C.payeeDate);
  t(formData.approvalDate, C.approvalDate);

  await embedSig(pdfDoc, page, formData.payeeSig,    C.payeeSig.x,    C.payeeSig.y,    C.payeeSig.w,    C.payeeSig.h);
  await embedSig(pdfDoc, page, formData.approvalSig, C.approvalSig.x, C.approvalSig.y, C.approvalSig.w, C.approvalSig.h);

  return pdfDoc.save();
}
