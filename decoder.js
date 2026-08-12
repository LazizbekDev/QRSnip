// ─── QRSnip · Universal Decoder (native + ZXing WASM) ───────────────────────

const NATIVE_FORMATS = [
  "qr_code",
  "aztec",
  "data_matrix",
  "pdf417",
  "ean_13",
  "ean_8",
  "upc_a",
  "upc_e",
  "code_128",
  "code_39",
  "code_93",
  "codabar",
  "itf",
];

/** @type {BarcodeDetector | null} */
let nativeDetector = null;
let zxingReady = false;
let initPromise = null;

/**
 * Normalize ZXing / BarcodeDetector format names to snake_case ids.
 * @param {string} format
 * @returns {string}
 */
function normalizeFormat(format) {
  if (!format) return "unknown";
  const raw = String(format).trim();
  const lower = raw.toLowerCase().replace(/[\s-]+/g, "_");

  const aliases = {
    qrcode: "qr_code",
    qr_code_model_1: "qr_code",
    qr_code_model_2: "qr_code",
    microqrcode: "micro_qr_code",
    micro_qrcode: "micro_qr_code",
    rmqrcode: "rm_qr_code",
    r_m_qr_code: "rm_qr_code",
    datamatrix: "data_matrix",
    maxicode: "maxi_code",
    azteccode: "aztec",
    aztecrune: "aztec_rune",
    pdf_417: "pdf417",
    compactpdf417: "compact_pdf417",
    micropdf417: "micro_pdf417",
    code39: "code_39",
    code39std: "code_39",
    code39ext: "code_39",
    code32: "code_32",
    code93: "code_93",
    code128: "code_128",
    ean13: "ean_13",
    ean8: "ean_8",
    eanupc: "ean_13",
    upca: "upc_a",
    upce: "upc_e",
    isbn: "ean_13",
    itf14: "itf_14",
    databar: "databar",
    databaromni: "databar",
    databarstk: "databar_stacked",
    databarstkomni: "databar_stacked",
    databarltd: "databar_limited",
    databarexp: "databar_expanded",
    databarexpstk: "databar_expanded",
    telepenalpha: "telepen",
    telepennumeric: "telepen",
  };

  if (aliases[lower]) return aliases[lower];
  // Already snake_case from BarcodeDetector
  if (/^[a-z0-9_]+$/.test(lower)) return lower;
  // CamelCase → snake_case
  return raw
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}

/**
 * @param {HTMLCanvasElement | HTMLImageElement} source
 * @returns {HTMLCanvasElement}
 */
function toCanvas(source) {
  if (source instanceof HTMLCanvasElement) return source;
  const canvas = document.createElement("canvas");
  const w = source.naturalWidth || source.width || 1;
  const h = source.naturalHeight || source.height || 1;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(source, 0, 0);
  return canvas;
}

/**
 * Initialize native BarcodeDetector + ZXing WASM (idempotent).
 * @returns {Promise<void>}
 */
function initDecoder() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      if (typeof BarcodeDetector !== "undefined") {
        let formats = NATIVE_FORMATS;
        if (typeof BarcodeDetector.getSupportedFormats === "function") {
          const supported = await BarcodeDetector.getSupportedFormats();
          formats = NATIVE_FORMATS.filter((f) => supported.includes(f));
        }
        nativeDetector = new BarcodeDetector({
          formats: formats.length ? formats : undefined,
        });
      }
    } catch (err) {
      console.warn("[QRSnip] Native BarcodeDetector init failed:", err);
      nativeDetector = null;
    }

    try {
      if (typeof QRSnipZXing !== "undefined" && QRSnipZXing.init) {
        await QRSnipZXing.init();
        zxingReady = true;
      } else {
        console.warn("[QRSnip] ZXing bundle not loaded");
      }
    } catch (err) {
      console.warn("[QRSnip] ZXing WASM init failed:", err);
      zxingReady = false;
    }

    if (!nativeDetector && !zxingReady) {
      throw new Error("No barcode decoder available");
    }
  })();
  return initPromise;
}

/**
 * @param {{ x: number, y: number }[]} points
 * @returns {{ x: number, y: number, width: number, height: number } | null}
 */
function bboxFromPoints(points) {
  if (!points?.length) return null;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = maxX - minX;
  const height = maxY - minY;
  if (width <= 0 || height <= 0) return null;
  return { x: minX, y: minY, width, height };
}

/**
 * @param {{ x: number, y: number, width: number, height: number }} bbox
 * @returns {number}
 */
function bboxArea(bbox) {
  return bbox.width * bbox.height;
}

/**
 * Detect barcodes with bounding boxes in natural image pixel coordinates.
 * @param {HTMLCanvasElement | HTMLImageElement} source
 * @returns {Promise<{ rawValue: string, format: string, bbox: { x: number, y: number, width: number, height: number } }[]>}
 */
async function detectCodesWithBounds(source) {
  await initDecoder();

  const canvas = toCanvas(source);
  /** @type {Map<string, { rawValue: string, format: string, bbox: { x: number, y: number, width: number, height: number } }>} */
  const byValue = new Map();

  const push = (rawValue, format, bbox) => {
    const text = (rawValue || "").trim();
    if (!text || !bbox) return;
    const fmt = normalizeFormat(format);
    const existing = byValue.get(text);
    if (!existing) {
      byValue.set(text, { rawValue: text, format: fmt, bbox });
      return;
    }
    if (bboxArea(bbox) > bboxArea(existing.bbox)) {
      existing.bbox = bbox;
    }
  };

  if (nativeDetector) {
    try {
      const barcodes = await nativeDetector.detect(canvas);
      for (const b of barcodes) {
        let bbox = null;
        if (b.boundingBox) {
          bbox = {
            x: b.boundingBox.x,
            y: b.boundingBox.y,
            width: b.boundingBox.width,
            height: b.boundingBox.height,
          };
        } else if (b.cornerPoints?.length) {
          bbox = bboxFromPoints(b.cornerPoints);
        }
        push(b.rawValue || "", b.format || "unknown", bbox);
      }
    } catch (err) {
      console.warn("[QRSnip] Native detect failed:", err);
    }
  }

  if (zxingReady) {
    try {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const zxResults = await QRSnipZXing.read(imageData);
      for (const r of zxResults || []) {
        if (r && r.isValid === false) continue;
        const text = r.text || "";
        const pos = r.position;
        const bbox = pos
          ? bboxFromPoints([pos.topLeft, pos.topRight, pos.bottomRight, pos.bottomLeft])
          : null;
        push(text, r.format || "unknown", bbox);
      }
    } catch (err) {
      console.warn("[QRSnip] ZXing detect failed:", err);
    }
  }

  return Array.from(byValue.values());
}

/**
 * Detect barcodes using native API and/or ZXing WASM. Dedupes by raw value.
 * @param {HTMLCanvasElement | HTMLImageElement} source
 * @returns {Promise<{ rawValue: string, format: string }[]>}
 */
async function detectCodes(source) {
  const withBounds = await detectCodesWithBounds(source);
  return withBounds.map(({ rawValue, format }) => ({ rawValue, format }));
}

/**
 * @returns {boolean}
 */
function isDecoderReady() {
  return !!(nativeDetector || zxingReady);
}
