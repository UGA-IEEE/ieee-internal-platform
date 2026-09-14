import { PDFDocument } from 'pdf-lib';
import { getFont, drawText, embedSig, wrapText, FONT_SIZE } from './pdfUtils.js';
import { SPEEDTYPES } from '../data/data.js';

// Coordinates measured from bottom-left of a 612x792pt letter page.
// Adjust these if text lands slightly off after first test print.
const C = {
  name:        { x: 130, y: 636 },
  phone:       { x: 130, y: 614 },
  email:       { x: 105, y: 592 },
  clubName:    { x: 175, y: 566 },
  expenseDate: { x: 155, y: 514 },
  expenseAmt:  { x: 100, y: 492 },
  // Expense type — draw X inside the box
  typeFood:    { x: 272, y: 470 },
  typeTravel:  { x: 340, y: 470 },
  typeOther:   { x: 406, y: 470 },
  // Account type — draw X inside the box
  acctStudent:    { x: 249, y: 450 },
  acctAgency:     { x: 371, y: 450 },
  acctFoundation: { x: 461, y: 450 },
  // Speedtypes (always pre-filled for IEEE)
  stSpeedtype:   { x: 340, y: 430 },
  agSpeedtype:   { x: 270, y: 408 },
  fnSpeedtype:   { x: 312, y: 386 },
  // Purchased & justification
  purchased: { x: 105, y: 358 },
  justLines: [
    { x: 80, y: 308 },
    { x: 80, y: 290 },
    { x: 80, y: 272 },
    { x: 80, y: 254 },
    { x: 80, y: 236 },
  ],
  // Signatures
  facultyAdvisorSig: { x: 258, y: 128, w: 110, h: 30 },
  cengApproverSig:   { x: 258, y: 100, w: 110, h: 30 },
};

export async function fillCENGR(formData) {
  const pdfBytes = await fetch(`${import.meta.env.BASE_URL}forms/cengr-reimbursement.pdf`).then(r => r.arrayBuffer());
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPages()[0];
  const font = await getFont(pdfDoc);
  const t = (text, coord) => drawText(page, text, coord.x, coord.y, font);

  t(formData.name, C.name);
  t(formData.phone, C.phone);
  t(formData.email, C.email);
  t(formData.clubName || 'Institute of Electrical and Electronics Engineers', C.clubName);
  t(formData.expenseDate, C.expenseDate);
  t(formData.expenseAmount, C.expenseAmt);

  // Always fill all three speedtypes
  t(SPEEDTYPES.studentActivity.value, C.stSpeedtype);
  t(SPEEDTYPES.agency.value,          C.agSpeedtype);
  t(SPEEDTYPES.foundation.value,      C.fnSpeedtype);

  t(formData.purchased, C.purchased);

  // Expense type X
  if (formData.expenseType === 'food')   t('X', C.typeFood);
  if (formData.expenseType === 'travel') t('X', C.typeTravel);
  if (formData.expenseType === 'other')  t('X', C.typeOther);

  // Account type X
  if (formData.accountType === 'student')    t('X', C.acctStudent);
  if (formData.accountType === 'agency')     t('X', C.acctAgency);
  if (formData.accountType === 'foundation') t('X', C.acctFoundation);

  // Justification word-wrap
  const lines = wrapText(formData.justification, 95);
  lines.forEach((line, i) => {
    if (i < C.justLines.length) t(line, C.justLines[i]);
  });

  // Signatures
  const { facultyAdvisorSig: fa, cengApproverSig: ca } = C;
  await embedSig(pdfDoc, page, formData.facultyAdvisorSig, fa.x, fa.y, fa.w, fa.h);
  await embedSig(pdfDoc, page, formData.cengApproverSig,   ca.x, ca.y, ca.w, ca.h);

  return pdfDoc.save();
}
