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
    return { ...base, type: "empty", typeLabel: t("type_empty") };
  }

  // WIFI:T:WPA;S:NetworkName;P:password;;
  if (/^WIFI:/i.test(text)) {
    const meta = parseWifi(text);
    return {
      ...base,
      type: "wifi",
      typeLabel: t("type_wifi"),
      display: meta.ssid
        ? `${meta.ssid}${meta.password ? "\n" + t("password_label") + ": " + meta.password : ""}`
        : text,
      copyValue: meta.password || text,
      meta,
      primary: meta.password
        ? { id: "copy_password", label: t("copy_password"), value: meta.password }
        : { id: "copy", label: t("copy"), value: text },
    };
  }

  // BEGIN:VCARD ... END:VCARD
  if (/BEGIN:VCARD/i.test(text)) {
    const meta = parseVCard(text);
    const lines = [meta.name, meta.tel, meta.email].filter(Boolean);
    return {
      ...base,
      type: "vcard",
      typeLabel: t("type_contact"),
      display: lines.length ? lines.join("\n") : text,
      copyValue: text,
      meta,
      fields: contactFields(meta),
      primary: {
        id: "download",
        label: t("save_contact"),
        value: text.replace(/\r?\n/g, "\r\n"),
        filename: `${safeFilename(meta.name || "contact")}.vcf`,
        mime: "text/vcard",
      },
    };
  }

  // MECARD:N:Doe,John;TEL:123;EMAIL:a@b.c;;
  if (/^MECARD:/i.test(text)) {
    const meta = parseMeCard(text);
    return {
      ...base,
      type: "vcard",
      typeLabel: t("type_contact"),
      display: [meta.name, meta.tel, meta.email].filter(Boolean).join("\n") || text,
      meta,
      fields: contactFields(meta),
      primary: {
        id: "download",
        label: t("save_contact"),
        value: meCardToVCard(meta),
        filename: `${safeFilename(meta.name || "contact")}.vcf`,
        mime: "text/vcard",
      },
    };
  }

  // BEGIN:VEVENT / BEGIN:VCALENDAR
  if (/BEGIN:(VEVENT|VCALENDAR)/i.test(text)) {
    const ev = parseVEvent(text);
    return {
      ...base,
      type: "event",
      typeLabel: t("type_event"),
      title: ev.summary || "",
      display: [ev.summary, ev.when, ev.location].filter(Boolean).join("\n") || text,
      meta: ev,
      fields: [
        ev.when && { label: t("field_when"), value: ev.when },
        ev.location && { label: t("field_where"), value: ev.location },
        ev.description && { label: t("field_note"), value: ev.description },
      ].filter(Boolean),
      primary: {
        id: "download",
        label: t("add_to_calendar"),
        value: buildIcs(text),
        filename: `${safeFilename(ev.summary || "event")}.ics`,
        mime: "text/calendar",
      },
    };
  }

  // Payments & crypto (UPI, EPC/SEPA, EMV/PIX/PromptPay/QRIS/VietQR, wallets)
  const payment = parsePayment(text);
  if (payment) return { ...base, ...payment };

  // mailto:
  if (/^mailto:/i.test(text)) {
    const email = text.replace(/^mailto:/i, "").split("?")[0];
    return {
      ...base,
      type: "email",
      typeLabel: t("type_email"),
      display: email || text,
      meta: { email },
      primary: { id: "mailto", label: t("send_email"), value: text },
    };
  }

  // tel:
  if (/^tel:/i.test(text)) {
    const phone = text.replace(/^tel:/i, "");
    return {
      ...base,
      type: "tel",
      typeLabel: t("type_phone"),
      display: phone || text,
      meta: { phone },
      primary: { id: "tel", label: t("call"), value: text },
    };
  }

  // sms: or SMSTO:
  if (/^(sms|smsto):/i.test(text)) {
    const phone = text.replace(/^(sms|smsto):/i, "").split("?")[0].split(":")[0];
    return {
      ...base,
      type: "sms",
      typeLabel: t("type_sms"),
      display: phone || text,
      meta: { phone },
      primary: { id: "sms", label: t("send_sms"), value: text.startsWith("sms") ? text : `sms:${phone}` },
    };
  }

  // geo:lat,lon
  if (/^geo:/i.test(text)) {
    const coords = text.replace(/^geo:/i, "").split("?")[0];
    const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(coords)}`;
    return {
      ...base,
      type: "geo",
      typeLabel: t("type_location"),
      display: coords || text,
      meta: { coords, mapsUrl },
      primary: { id: "maps", label: t("open_maps"), value: mapsUrl },
    };
  }

  // URL
  if (/^https?:\/\//i.test(text) || /^www\./i.test(text)) {
    const href = /^https?:\/\//i.test(text) ? text : `https://${text}`;
    return {
      ...base,
      type: "url",
      typeLabel: t("type_link"),
      display: text,
      meta: { href },
      link: typeof analyzeLink === "function" ? analyzeLink(href) : null,
      primary: { id: "open", label: t("open_link"), value: href },
    };
  }

  // Script / data URLs never get an "Open" action
  if (/^(javascript|data|vbscript):/i.test(text)) {
    return {
      ...base,
      type: "text",
      typeLabel: t("type_text"),
      link: typeof analyzeLink === "function" ? analyzeLink(text) : null,
      primary: { id: "copy", label: t("copy"), value: text },
    };
  }

  // Bare crypto wallet address
  const wallet = parseBareWallet(text);
  if (wallet) return { ...base, ...wallet };

  // Bare email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    return {
      ...base,
      type: "email",
      typeLabel: t("type_email"),
      display: text,
      meta: { email: text },
      primary: { id: "mailto", label: t("send_email"), value: `mailto:${text}` },
    };
  }

  // EAN / UPC retail barcodes
  const product = parseProduct(text, fmt);
  if (product) return { ...base, ...product };

  return {
    ...base,
    type: "text",
    typeLabel: t("type_text"),
    primary: { id: "copy", label: t("copy"), value: text },
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
  const meta = { name: "", tel: "", email: "", org: "", url: "" };
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
      meta.org = line.slice(4).replace(/;+$/, "").replace(/;/g, " · ").trim();
    } else if (upper.startsWith("URL") && !meta.url) {
      meta.url = line.slice(line.indexOf(":") + 1).trim();
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
    case "download": {
      const blob = new Blob([value], { type: `${action.mime || "text/plain"};charset=utf-8` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = action.filename || "qrsnip.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      return "saved";
    }
    default:
      return "none";
  }
}


// ─── Smart types ────────────────────────────────────────────────────────────

function safeFilename(name) {
  return String(name).replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ").trim().slice(0, 60) || "qrsnip";
}

function contactFields(meta) {
  return [
    meta.org && { label: t("field_company"), value: meta.org },
    meta.tel && { label: t("field_phone"), value: meta.tel, mono: true },
    meta.email && { label: t("field_email"), value: meta.email },
    meta.url && { label: t("type_link"), value: meta.url },
  ].filter(Boolean);
}

/** Split "A:b;C:d;;" honoring backslash escapes (shared by MECARD). */
function splitEscaped(body, sep) {
  const parts = [];
  let cur = "";
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === "\\" && i + 1 < body.length) {
      cur += body[++i];
      continue;
    }
    if (ch === sep) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur) parts.push(cur);
  return parts;
}

function parseMeCard(text) {
  const meta = { name: "", tel: "", email: "", org: "", url: "", adr: "", note: "" };
  for (const part of splitEscaped(text.replace(/^MECARD:/i, ""), ";")) {
    const idx = part.indexOf(":");
    if (idx === -1) continue;
    const key = part.slice(0, idx).toUpperCase();
    const val = part.slice(idx + 1).trim();
    if (key === "N" && !meta.name) {
      const [last, first] = val.split(",");
      meta.name = [first, last].filter(Boolean).map((s) => s.trim()).join(" ");
    } else if (key === "TEL" && !meta.tel) meta.tel = val;
    else if (key === "EMAIL" && !meta.email) meta.email = val;
    else if (key === "ORG" && !meta.org) meta.org = val;
    else if (key === "URL" && !meta.url) meta.url = val;
    else if (key === "ADR" && !meta.adr) meta.adr = val;
    else if (key === "NOTE" && !meta.note) meta.note = val;
  }
  return meta;
}

function vEsc(v) {
  return String(v).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
}

function meCardToVCard(m) {
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];
  const name = m.name || m.org || "Contact";
  const [first, ...rest] = name.split(" ");
  lines.push(`N:${vEsc(rest.join(" "))};${vEsc(first)};;;`, `FN:${vEsc(name)}`);
  if (m.org) lines.push(`ORG:${vEsc(m.org)}`);
  if (m.tel) lines.push(`TEL:${vEsc(m.tel)}`);
  if (m.email) lines.push(`EMAIL:${vEsc(m.email)}`);
  if (m.url) lines.push(`URL:${vEsc(m.url)}`);
  if (m.adr) lines.push(`ADR:;;${vEsc(m.adr)};;;;`);
  if (m.note) lines.push(`NOTE:${vEsc(m.note)}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

// ─── Calendar ──────────────────────────────────────────────────────────────

function icsUnescape(v) {
  return v.replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1").trim();
}

/** "20261231T183000Z" / "20261231" → { date, allDay } */
function parseIcsDate(v) {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec((v || "").trim());
  if (!m) return null;
  const [, y, mo, d, h, mi, s, z] = m;
  if (!h) return { date: new Date(+y, +mo - 1, +d), allDay: true };
  const args = [+y, +mo - 1, +d, +h, +mi, +(s || 0)];
  return { date: z ? new Date(Date.UTC(...args)) : new Date(...args), allDay: false };
}

function formatWhen(start, end) {
  if (!start) return "";
  const loc = typeof getLocale === "function" ? getLocale() : undefined;
  try {
    const dateOpts = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
    const fmtDate = new Intl.DateTimeFormat(loc, dateOpts);
    if (start.allDay) {
      if (!end) return fmtDate.format(start.date);
      // DTEND is exclusive for all-day events
      const last = new Date(end.date.getTime() - 86400000);
      return last > start.date ? fmtDate.formatRange(start.date, last) : fmtDate.format(start.date);
    }
    const fmt = new Intl.DateTimeFormat(loc, { ...dateOpts, hour: "2-digit", minute: "2-digit" });
    return end ? fmt.formatRange(start.date, end.date) : fmt.format(start.date);
  } catch (_) {
    return start.date.toString();
  }
}

function parseVEvent(text) {
  // Unfold RFC 5545 continuation lines
  const lines = text.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);
  const ev = { summary: "", location: "", description: "", start: null, end: null, when: "" };
  let inEvent = !/BEGIN:VEVENT/i.test(text);
  for (const line of lines) {
    if (/^BEGIN:VEVENT/i.test(line)) inEvent = true;
    if (!inEvent) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).split(";")[0].toUpperCase();
    const val = line.slice(idx + 1);
    if (key === "SUMMARY") ev.summary = icsUnescape(val);
    else if (key === "LOCATION") ev.location = icsUnescape(val);
    else if (key === "DESCRIPTION") ev.description = icsUnescape(val).slice(0, 280);
    else if (key === "DTSTART") ev.start = parseIcsDate(val);
    else if (key === "DTEND") ev.end = parseIcsDate(val);
  }
  ev.when = formatWhen(ev.start, ev.end);
  return ev;
}

/** Wrap a bare VEVENT in a VCALENDAR and add the fields importers require. */
function buildIcs(text) {
  let body = text.replace(/\r?\n/g, "\r\n").trim();
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  if (!/^UID:/im.test(body)) {
    body = body.replace(/BEGIN:VEVENT/i, `BEGIN:VEVENT\r\nUID:${Date.now()}-${Math.random().toString(36).slice(2)}@qrsnip`);
  }
  if (!/^DTSTAMP:/im.test(body)) {
    body = body.replace(/BEGIN:VEVENT/i, `BEGIN:VEVENT\r\nDTSTAMP:${stamp}`);
  }
  if (!/BEGIN:VCALENDAR/i.test(body)) {
    body = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//QRSnip//EN\r\n${body}\r\nEND:VCALENDAR`;
  }
  return body + "\r\n";
}

// ─── Payments ──────────────────────────────────────────────────────────────

function formatMoney(amount, currency) {
  const n = Number(amount);
  if (!amount || !Number.isFinite(n)) return "";
  const loc = typeof getLocale === "function" ? getLocale() : undefined;
  if (currency && /^[A-Z]{3}$/.test(currency)) {
    try {
      return new Intl.NumberFormat(loc, { style: "currency", currency }).format(n);
    } catch (_) {}
  }
  const num = new Intl.NumberFormat(loc, { maximumFractionDigits: 8 }).format(n);
  return currency ? `${num} ${currency}` : num;
}

function groupChars(s, size = 4) {
  return String(s).replace(/\s+/g, "").replace(new RegExp(`(.{${size}})(?=.)`, "g"), "$1 ");
}

function paymentResult({ type = "payment", network, fields, primary, title }) {
  return {
    type,
    typeLabel: type === "crypto" ? t("type_crypto") : t("type_payment"),
    network,
    title: title || "",
    display: fields.map((f) => `${f.label}: ${f.value}`).join("\n"),
    fields,
    note: t("payment_tip"),
    primary,
  };
}

const EMV_CURRENCY = {
  "986": "BRL", "840": "USD", "978": "EUR", "356": "INR", "764": "THB", "360": "IDR",
  "704": "VND", "702": "SGD", "458": "MYR", "608": "PHP", "156": "CNY", "392": "JPY",
  "410": "KRW", "344": "HKD", "036": "AUD", "124": "CAD", "826": "GBP", "643": "RUB",
  "860": "UZS", "682": "SAR", "784": "AED", "586": "PKR", "050": "BDT", "116": "KHR",
  "418": "LAK", "104": "MMK", "901": "TWD", "484": "MXN", "604": "PEN", "170": "COP",
};

/** Parse EMVCo TLV ("000201...") into a map of tag → value. */
function parseTlv(s) {
  const out = {};
  let i = 0;
  while (i + 4 <= s.length) {
    const tag = s.slice(i, i + 2);
    const len = parseInt(s.slice(i + 2, i + 4), 10);
    if (!Number.isFinite(len) || i + 4 + len > s.length) return null;
    out[tag] = s.slice(i + 4, i + 4 + len);
    i += 4 + len;
  }
  return i === s.length ? out : null;
}

function emvNetwork(tlv) {
  for (let tag = 2; tag <= 51; tag++) {
    const key = String(tag).padStart(2, "0");
    const v = tlv[key];
    if (!v) continue;
    const sub = tag >= 26 ? parseTlv(v) : null;
    const gui = (sub?.["00"] || v).toLowerCase();
    if (gui.includes("br.gov.bcb.pix")) return { name: "PIX", account: sub?.["01"] };
    if (gui.includes("a000000677010111") || gui.includes("a000000677010112")) {
      return { name: "PromptPay", account: sub?.["01"] || sub?.["02"] || sub?.["03"] };
    }
    if (gui.includes("id.co.qris")) return { name: "QRIS", account: sub?.["02"] };
    if (gui.includes("a000000727")) {
      const inner = sub?.["01"] ? parseTlv(sub["01"]) : null;
      return { name: "VietQR", account: inner?.["01"] };
    }
    if (gui.includes("sg.paynow")) return { name: "PayNow", account: sub?.["02"] };
    if (gui.includes("hk.com.hkicl")) return { name: "FPS", account: sub?.["02"] };
    if (gui.includes("ch.qr") || gui.includes("duitnow")) return { name: "DuitNow", account: sub?.["01"] };
  }
  return { name: "EMV QR", account: "" };
}

const CRYPTO_SCHEMES = {
  bitcoin: "Bitcoin", ethereum: "Ethereum", litecoin: "Litecoin", bitcoincash: "Bitcoin Cash",
  dogecoin: "Dogecoin", monero: "Monero", solana: "Solana", tron: "TRON", ripple: "XRP",
  xrp: "XRP", cardano: "Cardano", ton: "TON", dash: "Dash", zcash: "Zcash", stellar: "Stellar",
};

function cryptoResult(network, address, amount, unit, label, raw) {
  return paymentResult({
    type: "crypto",
    network,
    title: label || "",
    fields: [
      { label: t("field_network"), value: network },
      { label: t("field_address"), value: address, mono: true, strong: true },
      amount && { label: t("field_amount"), value: `${amount} ${unit}`.trim(), strong: true },
      label && { label: t("field_note"), value: label },
    ].filter(Boolean),
    primary: { id: "copy", label: t("copy_address"), value: address },
  });
}

/** @returns {object|null} partial parsed payload */
function parsePayment(text) {
  // UPI (India): upi://pay?pa=name@bank&pn=Name&am=10&cu=INR&tn=note
  if (/^upi:\/\//i.test(text)) {
    let q;
    try {
      q = new URL(text).searchParams;
    } catch (_) {
      return null;
    }
    const pa = q.get("pa") || "";
    const cu = (q.get("cu") || "INR").toUpperCase();
    return paymentResult({
      network: "UPI",
      title: q.get("pn") || pa,
      fields: [
        q.get("pn") && { label: t("field_payee"), value: q.get("pn"), strong: true },
        pa && { label: t("field_account"), value: pa, mono: true },
        q.get("am") && { label: t("field_amount"), value: formatMoney(q.get("am"), cu), strong: true },
        q.get("tn") && { label: t("field_note"), value: q.get("tn") },
      ].filter(Boolean),
      primary: { id: "copy", label: t("copy_upi_id"), value: pa || text },
    });
  }

  // EPC / SEPA credit transfer (Girocode)
  if (/^BCD\r?\n/.test(text)) {
    const l = text.split(/\r?\n/);
    if ((l[3] || "").trim() !== "SCT") return null;
    const iban = (l[6] || "").replace(/\s+/g, "");
    const amt = /^([A-Z]{3})(\d+(?:\.\d{1,2})?)$/.exec((l[7] || "").trim());
    return paymentResult({
      network: "SEPA",
      title: (l[5] || "").trim(),
      fields: [
        l[5] && { label: t("field_payee"), value: l[5].trim(), strong: true },
        iban && { label: "IBAN", value: groupChars(iban), mono: true },
        l[4]?.trim() && { label: t("field_bic"), value: l[4].trim(), mono: true },
        amt && { label: t("field_amount"), value: formatMoney(amt[2], amt[1]), strong: true },
        (l[9]?.trim() || l[10]?.trim()) && {
          label: t("field_reference"),
          value: (l[9]?.trim() || l[10]?.trim()),
        },
      ].filter(Boolean),
      primary: { id: "copy", label: t("copy_iban"), value: iban || text },
    });
  }

  // EMVCo merchant QR (PIX, PromptPay, QRIS, VietQR, PayNow, …)
  if (/^000201/.test(text)) {
    const tlv = parseTlv(text);
    if (!tlv) return null;
    const net = emvNetwork(tlv);
    const currency = EMV_CURRENCY[tlv["53"]] || "";
    const name = (tlv["59"] || "").trim();
    return paymentResult({
      network: net.name,
      title: name,
      fields: [
        name && { label: t("field_payee"), value: name, strong: true },
        net.account && { label: t("field_account"), value: net.account, mono: true },
        tlv["60"]?.trim() && { label: t("field_city"), value: tlv["60"].trim() },
        tlv["54"] && { label: t("field_amount"), value: formatMoney(tlv["54"], currency), strong: true },
      ].filter(Boolean),
      primary: { id: "copy", label: t("copy_payment_code"), value: text },
    });
  }

  // Crypto payment URIs (BIP21, EIP-681, …)
  const m = /^([a-z]+):(?:\/\/)?([^?@/]+)(?:@(\d+))?(?:\/[^?]*)?(?:\?(.*))?$/i.exec(text);
  if (m && CRYPTO_SCHEMES[m[1].toLowerCase()]) {
    const scheme = m[1].toLowerCase();
    const params = new URLSearchParams(m[4] || "");
    let amount = params.get("amount") || "";
    let unit = { bitcoin: "BTC", litecoin: "LTC", bitcoincash: "BCH", dogecoin: "DOGE", monero: "XMR", solana: "SOL", dash: "DASH", zcash: "ZEC" }[scheme] || "";
    if (scheme === "ethereum") {
      unit = "ETH";
      const wei = params.get("value");
      if (wei && Number.isFinite(Number(wei))) amount = String(Number(wei) / 1e18);
    }
    const label = params.get("label") || params.get("message") || params.get("memo") || "";
    return cryptoResult(CRYPTO_SCHEMES[scheme], m[2], amount, unit, label, text);
  }

  return null;
}

function parseBareWallet(text) {
  if (/^0x[a-fA-F0-9]{40}$/.test(text)) return cryptoResult("Ethereum / EVM", text);
  if (/^bc1[ac-hj-np-z02-9]{25,87}$/i.test(text)) return cryptoResult("Bitcoin", text);
  if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(text)) return cryptoResult("Bitcoin", text);
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(text)) return cryptoResult("TRON", text);
  return null;
}

// ─── Retail barcodes ───────────────────────────────────────────────────────

/** [first 3-digit prefix, last, ISO region] — GS1 member organisation ranges. */
const GS1_PREFIXES = [
  [0, 19, "US"], [30, 39, "US"], [60, 139, "US"], [300, 379, "FR"], [380, 380, "BG"],
  [383, 383, "SI"], [385, 385, "HR"], [387, 387, "BA"], [389, 389, "ME"], [400, 440, "DE"],
  [450, 459, "JP"], [460, 469, "RU"], [470, 470, "KG"], [471, 471, "TW"], [474, 474, "EE"],
  [475, 475, "LV"], [476, 476, "AZ"], [477, 477, "LT"], [478, 478, "UZ"], [479, 479, "LK"],
  [480, 480, "PH"], [481, 481, "BY"], [482, 482, "UA"], [483, 483, "TM"], [484, 484, "MD"],
  [485, 485, "AM"], [486, 486, "GE"], [487, 487, "KZ"], [488, 488, "TJ"], [489, 489, "HK"],
  [490, 499, "JP"], [500, 509, "GB"], [520, 521, "GR"], [528, 528, "LB"], [529, 529, "CY"],
  [530, 530, "AL"], [531, 531, "MK"], [535, 535, "MT"], [539, 539, "IE"], [540, 549, "BE"],
  [560, 560, "PT"], [569, 569, "IS"], [570, 579, "DK"], [590, 590, "PL"], [594, 594, "RO"],
  [599, 599, "HU"], [600, 601, "ZA"], [608, 608, "BH"], [611, 611, "MA"], [613, 613, "DZ"],
  [616, 616, "KE"], [619, 619, "TN"], [621, 621, "SY"], [622, 622, "EG"], [625, 625, "JO"],
  [626, 626, "IR"], [627, 627, "KW"], [628, 628, "SA"], [629, 629, "AE"], [640, 649, "FI"],
  [690, 699, "CN"], [700, 709, "NO"], [729, 729, "IL"], [730, 739, "SE"], [740, 740, "GT"],
  [741, 741, "SV"], [742, 742, "HN"], [743, 743, "NI"], [744, 744, "CR"], [745, 745, "PA"],
  [746, 746, "DO"], [750, 750, "MX"], [754, 755, "CA"], [759, 759, "VE"], [760, 769, "CH"],
  [770, 771, "CO"], [773, 773, "UY"], [775, 775, "PE"], [777, 777, "BO"], [779, 779, "AR"],
  [780, 780, "CL"], [784, 784, "PY"], [786, 786, "EC"], [789, 790, "BR"], [800, 839, "IT"],
  [840, 849, "ES"], [850, 850, "CU"], [858, 858, "SK"], [859, 859, "CZ"], [860, 860, "RS"],
  [865, 865, "MN"], [867, 867, "KP"], [868, 869, "TR"], [870, 879, "NL"], [880, 880, "KR"],
  [884, 884, "KH"], [885, 885, "TH"], [888, 888, "SG"], [890, 890, "IN"], [893, 893, "VN"],
  [896, 896, "PK"], [899, 899, "ID"], [900, 919, "AT"], [930, 939, "AU"], [940, 949, "NZ"],
  [955, 955, "MY"], [958, 958, "MO"],
];

function gtinCheckOk(digits) {
  const d = [...digits].map(Number);
  const check = d.pop();
  let sum = 0;
  d.reverse().forEach((n, i) => (sum += n * (i % 2 === 0 ? 3 : 1)));
  return (10 - (sum % 10)) % 10 === check;
}

function regionName(code) {
  try {
    const loc = typeof getLocale === "function" ? getLocale() : "en";
    return new Intl.DisplayNames([loc, "en"], { type: "region" }).of(code) || code;
  } catch (_) {
    return code;
  }
}

function parseProduct(text, format) {
  const f = (format || "").toLowerCase();
  if (!/^(ean_13|ean_8|upc_a|upc_e)$/.test(f) || !/^\d{8,13}$/.test(text)) return null;

  const gtin13 = text.length === 12 ? "0" + text : text;
  const checkable = f !== "upc_e" && [8, 12, 13].includes(text.length);
  const checkOk = !checkable || gtinCheckOk(text);
  const p3 = text.length === 8 ? NaN : parseInt(gtin13.slice(0, 3), 10);

  const isBook = p3 === 978 || p3 === 979;
  let origin = "";
  let notice = "";
  if (isBook) origin = "ISBN";
  else if (p3 === 977) origin = "ISSN";
  else if ((p3 >= 20 && p3 <= 29) || (p3 >= 40 && p3 <= 49) || (p3 >= 200 && p3 <= 299)) {
    notice = t("product_internal");
  } else if (p3 === 980 || (p3 >= 981 && p3 <= 984) || p3 >= 990) {
    notice = t("product_coupon");
  } else if (Number.isFinite(p3)) {
    const hit = GS1_PREFIXES.find(([a, b]) => p3 >= a && p3 <= b);
    if (hit) origin = regionName(hit[2]);
  }

  const query = isBook ? `isbn ${text}` : text;
  return {
    type: isBook ? "book" : "product",
    typeLabel: isBook ? t("type_book") : t("type_product"),
    title: groupProductCode(text),
    display: text,
    fields: [
      { label: isBook ? "ISBN" : t("field_code"), value: text, mono: true, strong: true },
      origin && !isBook && { label: t("field_registered"), value: origin },
    ].filter(Boolean),
    note: !checkOk ? t("product_bad_check") : notice,
    noteLevel: !checkOk ? "warn" : "info",
    primary: {
      id: "open",
      label: t("search_product"),
      value: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    },
  };
}

function groupProductCode(s) {
  if (s.length === 13) return `${s[0]} ${s.slice(1, 7)} ${s.slice(7)}`;
  if (s.length === 12) return `${s[0]} ${s.slice(1, 6)} ${s.slice(6, 11)} ${s[11]}`;
  if (s.length === 8) return `${s.slice(0, 4)} ${s.slice(4)}`;
  return s;
}
