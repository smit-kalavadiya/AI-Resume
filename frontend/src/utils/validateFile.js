import { MAX_FILE_BYTES } from "../config";

// PDF files begin with the 5 bytes "%PDF-" (0x25 0x50 0x44 0x46 0x2D).
// SECURITY: browsers report `file.type` from the filename extension /
// OS association — it's trivial to rename a .exe to resume.pdf and have
// `file.type` still say "application/pdf". Reading the real header bytes
// is what actually confirms the content is a PDF before it ever reaches
// the network. This does not replace server-side validation (a client
// can send anything it wants directly to the API) — the backend must
// re-check this independently.
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d];

async function hasValidPdfHeader(file) {
  const head = await file.slice(0, 5).arrayBuffer();
  const bytes = new Uint8Array(head);
  return PDF_MAGIC.every((byte, i) => bytes[i] === byte);
}

// Characters that are risky to echo back into the UI or forward to a
// backend that might use the filename for a filesystem path. We only
// ever display this client-side, but sanitizing early is cheap insurance
// against path traversal ("../../etc/passwd") or injection if the
// filename is later logged, stored, or rendered elsewhere.
const UNSAFE_FILENAME_CHARS = /[<>:"/\\|?*\x00-\x1f]/g;

export function sanitizeFileName(name) {
  return name.replace(UNSAFE_FILENAME_CHARS, "_").slice(0, 255);
}

/**
 * Validates a File before it's ever attached to a request.
 * Returns { ok: true } or { ok: false, reason: string }.
 */
export async function validateResumeFile(file) {
  if (!file) return { ok: false, reason: "No file was selected." };

  if (file.size === 0) {
    return { ok: false, reason: "That file is empty." };
  }

  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, reason: "That file is larger than the 10 MB limit." };
  }

  if (file.type !== "application/pdf") {
    return { ok: false, reason: "That file isn't a PDF. Please choose a .pdf resume." };
  }

  const validHeader = await hasValidPdfHeader(file);
  if (!validHeader) {
    return { ok: false, reason: "That file doesn't look like a valid PDF." };
  }

  return { ok: true };
}
