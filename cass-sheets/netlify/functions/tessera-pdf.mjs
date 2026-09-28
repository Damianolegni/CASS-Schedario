// Generates the CASS membership-card PDF (tessera) using the club's ACTUAL
// card design (front + retro) as background images, with the 4 dynamic
// fields (Nome e Cognome, N° Tessera, Data di Emissione, Data di Scadenza)
// drawn on top of the retro face at their exact measured positions.
//
// The front face is used exactly as-is (no overlay).
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { FRONT_B64, RETRO_B64, FRONT_SIZE, RETRO_SIZE } from "./tessera-template.mjs";

// ---- Page / card layout (points) ----
const MARGIN = 24;
const CARD_W = 320; // card width on the page, in points
const CARD_ASPECT = RETRO_SIZE[1] / RETRO_SIZE[0]; // height/width (retro & front share the same card ratio)
const CARD_H = CARD_W * CARD_ASPECT;
const PAGE_W = CARD_W + MARGIN * 2;
const PAGE_H = CARD_H + MARGIN * 2;

// ---- Field positions, measured in RETRO-image PIXEL coordinates ----
// (origin top-left of the cropped retro card image, y grows downward)
// labelEnd: right edge of the printed label text (value should start after this)
// underlineRow: the row (y, top-down) of the thin underline beneath each field
// lineEnd: right-hand end of that underline (value should not print past this)
const IMG_W = RETRO_SIZE[0];
const IMG_H = RETRO_SIZE[1];

const FIELDS = {
  nome: { labelEnd: 828, underlineRow: 146.5, lineEnd: 1105 },
  tessera: { labelEnd: 738, underlineRow: 246.5, lineEnd: 1106 },
  emissione: { labelEnd: 828, underlineRow: 353.5, lineEnd: 1106 },
  scadenza: { labelEnd: 829, underlineRow: 459.5, lineEnd: 1105 },
};

const NAVY = rgb(0.05, 0.13, 0.33);

function b64ToBytes(b64) {
  return Uint8Array.from(Buffer.from(b64, "base64"));
}

export async function generateTesseraPDF(data) {
  const { nome = "", cognome = "", tessera = "", dataIscrizione = "", dataScadenza = "" } = data || {};

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const frontImg = await pdfDoc.embedJpg(b64ToBytes(FRONT_B64));
  const retroImg = await pdfDoc.embedJpg(b64ToBytes(RETRO_B64));

  const cardX = MARGIN;
  const cardY = MARGIN;
  const scale = CARD_W / IMG_W; // px -> pt (uniform, since CARD_H/IMG_H is the same ratio)

  // ---- Page 1: FRONTE (image only) ----
  const page1 = pdfDoc.addPage([PAGE_W, PAGE_H]);
  const frontH = CARD_W * (FRONT_SIZE[1] / FRONT_SIZE[0]);
  page1.drawImage(frontImg, { x: cardX, y: cardY + (CARD_H - frontH) / 2, width: CARD_W, height: frontH });

  // ---- Page 2: RETRO (image + dynamic fields) ----
  const page2 = pdfDoc.addPage([PAGE_W, PAGE_H]);
  page2.drawImage(retroImg, { x: cardX, y: cardY, width: CARD_W, height: CARD_H });

  function pxToPdf(px, pyRow) {
    return { x: cardX + px * scale, y: cardY + (IMG_H - pyRow) * scale };
  }

  function writeValue(fieldKey, text, maxSize) {
    const field = FIELDS[fieldKey];
    const { y } = pxToPdf(0, field.underlineRow - 7 / scale); // baseline sits ~7px above the underline
    const labelEndPt = cardX + field.labelEnd * scale;
    const lineEndPt = cardX + field.lineEnd * scale;
    const available = lineEndPt - labelEndPt - 8;

    let size = maxSize;
    let width = font.widthOfTextAtSize(text, size);
    while (width > available && size > 5) {
      size -= 0.5;
      width = font.widthOfTextAtSize(text, size);
    }
    // If it still doesn't fit at the minimum size, truncate with an ellipsis
    // rather than let it collide with the label.
    let out = text;
    while (width > available && out.length > 1) {
      out = out.slice(0, -1);
      width = font.widthOfTextAtSize(out + "…", size);
    }
    if (out !== text) out += "…";

    const x = lineEndPt - width; // right-align, ending at the underline's right edge
    page2.drawText(out, { x, y, size, font, color: NAVY });
  }

  writeValue("nome", `${nome} ${cognome}`.trim().toUpperCase(), 11.5);
  writeValue("tessera", String(tessera), 14);
  writeValue("emissione", dataIscrizione, 11.5);
  writeValue("scadenza", dataScadenza, 11.5);

  return pdfDoc.save();
}
