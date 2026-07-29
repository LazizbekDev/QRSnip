// ─── QRSnip · Payload Parser ────────────────────────────────────────────────

const FORMAT_LABELS = {
  qr_code: "QR",
  micro_qr_code: "Micro QR",
  rm_qr_code: "rMQR",
  aztec: "Aztec",
  aztec_rune: "Aztec Rune",
  data_matrix: "Data Matrix",
  maxi_code: "MaxiCode",
  pdf417: "PDF417",
  compact_pdf417: "Compact PDF417",
  micro_pdf417: "Micro PDF417",
  ean_13: "EAN-13",
  ean_8: "EAN-8",
  upc_a: "UPC-A",
  upc_e: "UPC-E",
  code_128: "Code 128",
  code_39: "Code 39",
  code_93: "Code 93",
  code_32: "Code 32",
  pzn: "PZN",
  codabar: "Codabar",
  itf: "ITF",
  itf_14: "ITF-14",
  databar: "DataBar",
  databar_stacked: "DataBar Stacked",
  databar_limited: "DataBar Limited",
  databar_expanded: "DataBar Expanded",
  telepen: "Telepen",
  dx_film_edge: "DX Film Edge",
  unknown: "Code",
};

/**
 * @param {string} format - BarcodeDetector format string
 * @returns {string}
 */
function formatLabel(format) {
  return FORMAT_LABELS[format] || format || FORMAT_LABELS.unknown;
}

/**
 * Parse raw barcode/QR payload into a typed result with actions.
 * @param {string} raw
 * @param {string} [format]
 * @returns {{
 *   type: string,
 *   typeLabel: string,
 *   format: string,
 *   formatLabel: string,
 *   raw: string,
 *   display: string,
 *   primary: { id: string, label: string, value?: string } | null,
 *   copyValue: string,
 *   meta: Record<string, string>
 * }}
 */
function parsePayload(raw, format = "unknown") {
  const text = (raw || "").trim();
  const fmt = format || "unknown";
  const base = {
    format: fmt,
    formatLabel: formatLabel(fmt),
    raw: text,
    display: text,
    copyValue: text,
    meta: {},
    primary: null,
  };

  if (!text) {
    return { ...base, type: "empty", typeLabel: "Empty" };
  }

  // WIFI:T:WPA;S:NetworkName;P:password;;
  if (/^WIFI:/i.test(text)) {
    const meta = parseWifi(text);
    return {
      ...base,
      type: "wifi",
      typeLabel: "Wi‑Fi",
      display: meta.ssid
        ? `${meta.ssid}${meta.password ? "\nPassword: " + meta.password : ""}`
        : text,
      copyValue: meta.password || text,
      meta,
      primary: meta.password
        ? { id: "copy_password", label: "Copy Password", value: meta.password }
        : { id: "copy", label: "Copy", value: text },
    };
  }

  // BEGIN:VCARD ... END:VCARD
  if (/BEGIN:VCARD/i.test(text)) {
    const meta = parseVCard(text);
    const lines = [meta.name, meta.tel, meta.email].filter(Boolean);
    return {
      ...base,
      type: "vcard",
      typeLabel: "Contact",
      display: lines.length ? lines.join("\n") : text,
      copyValue: text,
      meta,
      primary: { id: "copy", label: "Copy Contact", value: text },
    };
  }

  // mailto:
  if (/^mailto:/i.test(text)) {
    const email = text.replace(/^mailto:/i, "").split("?")[0];
    return {
      ...base,
      type: "email",
      typeLabel: "Email",
      display: email || text,
      meta: { email },
      primary: { id: "mailto", label: "Send Email", value: text },
    };
  }

  // tel:
  if (/^tel:/i.test(text)) {
    const phone = text.replace(/^tel:/i, "");
    return {
      ...base,
      type: "tel",
      typeLabel: "Phone",
      display: phone || text,
      meta: { phone },
      primary: { id: "tel", label: "Call", value: text },
    };
  }

  // sms: or SMSTO:
  if (/^(sms|smsto):/i.test(text)) {
    const phone = text.replace(/^(sms|smsto):/i, "").split("?")[0].split(":")[0];
    return {
      ...base,
      type: "sms",
      typeLabel: "SMS",
      display: phone || text,
      meta: { phone },
      primary: { id: "sms", label: "Send SMS", value: text.startsWith("sms") ? text : `sms:${phone}` },
    };
  }

  // geo:lat,lon
  if (/^geo:/i.test(text)) {
    const coords = text.replace(/^geo:/i, "").split("?")[0];
    const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(coords)}`;
    return {
      ...base,
      type: "geo",
      typeLabel: "Location",
      display: coords || text,
      meta: { coords, mapsUrl },
      primary: { id: "maps", label: "Open Maps", value: mapsUrl },
    };
  }

  // URL
  if (/^https?:\/\//i.test(text) || /^www\./i.test(text)) {
    const href = /^https?:\/\//i.test(text) ? text : `https://${text}`;
    return {
      ...base,
      type: "url",
      typeLabel: "Link",
      display: text,
      meta: { href },
      primary: { id: "open", label: "Open Link", value: href },
    };
  }

  // Bare email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    return {
      ...base,
      type: "email",
      typeLabel: "Email",
      display: text,
      meta: { email: text },
      primary: { id: "mailto", label: "Send Email", value: `mailto:${text}` },
    };
  }

  return {
    ...base,
    type: "text",
    typeLabel: "Text",
    primary: { id: "copy", label: "Copy", value: text },
  };
}

function parseWifi(text) {
  const meta = { ssid: "", password: "", security: "", hidden: "" };
  const body = text.replace(/^WIFI:/i, "");
  let current = "";
  const parts = [];
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === "\\" && i + 1 < body.length) {
      current += body[i + 1];
      i++;
      continue;
    }
    if (ch === ";") {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current) parts.push(current);

  for (const part of parts) {
    const idx = part.indexOf(":");
    if (idx === -1) continue;
    const key = part.slice(0, idx).toUpperCase();
    const val = part.slice(idx + 1);
    if (key === "S") meta.ssid = val;
    else if (key === "P") meta.password = val;
    else if (key === "T") meta.security = val;
    else if (key === "H") meta.hidden = val;
  }
  return meta;
}

function parseVCard(text) {
  const meta = { name: "", tel: "", email: "", org: "" };
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const upper = line.toUpperCase();
    if (upper.startsWith("FN:")) meta.name = line.slice(3).trim();
    else if (upper.startsWith("N:") && !meta.name) {
      const parts = line.slice(2).split(";");
      meta.name = [parts[1], parts[0]].filter(Boolean).join(" ").trim();
    } else if (upper.startsWith("TEL") && !meta.tel) {
      meta.tel = line.split(":").pop().trim();
    } else if (upper.startsWith("EMAIL") && !meta.email) {
      meta.email = line.split(":").pop().trim();
    } else if (upper.startsWith("ORG:") && !meta.org) {
      meta.org = line.slice(4).trim();
    }
  }
  return meta;
}

/**
 * Run primary action for a parsed payload.
 * @param {{ id: string, value?: string }} action
 * @returns {Promise<'copied'|'opened'|'none'>}
 */
async function runPrimaryAction(action) {
  if (!action) return "none";
  const value = action.value || "";

  switch (action.id) {
    case "copy":
    case "copy_password":
      await navigator.clipboard.writeText(value);
      return "copied";
    case "open":
    case "maps":
      window.open(value, "_blank", "noopener");
      return "opened";
    case "mailto":
    case "tel":
    case "sms":
      window.location.href = value;
      return "opened";
    default:
      return "none";
  }
}
