// ─── QRSnip · Link safety (offline heuristics) ──────────────────────────────
// Everything here runs locally. No URL is ever sent anywhere to be checked.
// The goal is to surface the tricks phishing QR codes rely on, not to promise
// that a link is safe — so the best verdict is "no red flags found".

const LINK_SHORTENERS = new Set([
  "bit.ly", "bitly.com", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly",
  "cutt.ly", "rebrand.ly", "shorturl.at", "tiny.cc", "rb.gy", "s.id", "t.ly", "qrco.de",
  "bl.ink", "lnkd.in", "short.io", "shorturl.com", "v.gd", "x.co", "y2u.be", "soo.gd",
  "clck.ru", "tiny.one", "shrtco.de", "qr.net", "qrs.ly", "me-qr.com", "l.ead.me",
  "linktr.ee", "urlz.fr", "u.to", "trib.al", "dlvr.it", "ift.tt", "adf.ly", "shorte.st",
  "2u.pw", "surl.li", "zpr.io", "kutt.it", "tr.ee", "han.gl", "abre.ai", "encurtador.com.br",
]);

/** Second-level public suffixes, so "shop.example.co.uk" → "example.co.uk". */
const MULTI_PART_SUFFIXES = new Set([
  "co.uk", "org.uk", "ac.uk", "gov.uk", "me.uk", "ltd.uk", "plc.uk",
  "com.au", "net.au", "org.au", "edu.au", "gov.au",
  "co.jp", "ne.jp", "or.jp", "ac.jp", "go.jp",
  "co.kr", "or.kr", "co.in", "net.in", "org.in", "gov.in", "ac.in",
  "com.br", "net.br", "org.br", "gov.br", "com.cn", "net.cn", "org.cn", "gov.cn",
  "com.tr", "gov.tr", "com.mx", "com.ar", "co.za", "co.nz", "com.sg", "com.my",
  "co.id", "go.id", "ac.id", "co.th", "in.th", "go.th", "ac.th", "com.vn", "gov.vn",
  "com.ua", "com.ru", "com.uz", "co.uz", "com.sa", "gov.sa", "com.eg", "com.pk",
  "com.ng", "com.tw", "com.hk", "co.il", "ac.ir", "co.ir", "com.ph", "com.co",
  "com.pe", "com.ec", "com.bd", "com.np", "com.kz", "github.io", "web.app",
  "pages.dev", "vercel.app", "netlify.app", "herokuapp.com", "blogspot.com",
]);

const RISKY_DOWNLOAD_EXT = /\.(apk|xapk|exe|msi|dmg|pkg|scr|bat|cmd|ps1|vbs|jar|appx|msix|iso|com)$/i;

const DOMAIN_LIKE_LABELS = new Set([
  "com", "net", "org", "gov", "edu", "io", "co", "app", "bank", "uz", "ru", "de", "in",
]);

/** Non-Latin characters commonly used to imitate Latin letters. */
const CONFUSABLE_CHARS = new Set([
  ..."аеорсухіјѕԁһӏԛԝіїɡ",           // Cyrillic
  ..."αοрνκτιυϲєѵ",                    // Greek & friends
  ..."օսոհց",                          // Armenian
]);

// ─── Punycode (RFC 3492) decode ────────────────────────────────────────────
function punycodeDecode(input) {
  const base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700;
  let n = 128, i = 0, bias = 72;
  const output = [];
  let basic = input.lastIndexOf("-");
  if (basic < 0) basic = 0;
  for (let j = 0; j < basic; j++) output.push(input.charCodeAt(j));

  const adapt = (delta, numPoints, first) => {
    delta = first ? Math.floor(delta / damp) : delta >> 1;
    delta += Math.floor(delta / numPoints);
    let k = 0;
    while (delta > ((base - tMin) * tMax) >> 1) {
      delta = Math.floor(delta / (base - tMin));
      k += base;
    }
    return k + Math.floor(((base - tMin + 1) * delta) / (delta + skew));
  };
  const digit = (cp) =>
    cp - 48 < 10 ? cp - 22 : cp - 65 < 26 ? cp - 65 : cp - 97 < 26 ? cp - 97 : base;

  for (let idx = basic > 0 ? basic + 1 : 0; idx < input.length; ) {
    const oldi = i;
    for (let w = 1, k = base; ; k += base) {
      if (idx >= input.length) throw new Error("bad punycode");
      const d = digit(input.charCodeAt(idx++));
      if (d >= base) throw new Error("bad punycode");
      i += d * w;
      const tt = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
      if (d < tt) break;
      w *= base - tt;
    }
    const len = output.length + 1;
    bias = adapt(i - oldi, len, oldi === 0);
    n += Math.floor(i / len);
    i %= len;
    output.splice(i++, 0, n);
  }
  return String.fromCodePoint(...output);
}

/** "xn--pple-43d.com" → "аpple.com" (Unicode as the attacker intended it to look). */
function decodeHostname(host) {
  return host
    .split(".")
    .map((label) => {
      if (!label.startsWith("xn--")) return label;
      try {
        return punycodeDecode(label.slice(4));
      } catch (_) {
        return label;
      }
    })
    .join(".");
}

function isIpHost(host) {
  if (/^\[[0-9a-f:.]+\]$/i.test(host)) return true;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  // Decimal / hex IPv4 tricks like http://3232235777 or http://0xC0A80001
  if (/^(0x[0-9a-f]{1,8}|\d{8,10})$/i.test(host)) return true;
  return false;
}

/**
 * @param {string} host ASCII hostname
 * @returns {{ registrable: string, subdomain: string }}
 */
function splitRegistrable(host) {
  if (isIpHost(host)) return { registrable: host, subdomain: "" };
  const labels = host.split(".").filter(Boolean);
  if (labels.length <= 2) return { registrable: labels.join("."), subdomain: "" };
  const lastTwo = labels.slice(-2).join(".");
  const take = MULTI_PART_SUFFIXES.has(lastTwo) ? 3 : 2;
  return {
    registrable: labels.slice(-take).join("."),
    subdomain: labels.slice(0, -take).join("."),
  };
}

function hasLatin(s) {
  return /\p{Script=Latin}/u.test(s);
}
function hasNonLatinLetter(s) {
  return [...s].some((c) => /\p{L}/u.test(c) && !/\p{Script=Latin}/u.test(c));
}

/**
 * Lookalike = mixes Latin with another script inside one label, or is made only
 * of characters that imitate Latin letters while using a Latin TLD.
 */
function isLookalikeHost(unicodeHost) {
  const labels = unicodeHost.split(".");
  const tld = labels[labels.length - 1] || "";
  const latinTld = /^[a-z]+$/i.test(tld);
  return labels.slice(0, -1).some((label) => {
    if (!hasNonLatinLetter(label)) return false;
    if (hasLatin(label)) return true;
    const letters = [...label].filter((c) => /\p{L}/u.test(c));
    return latinTld && letters.length > 0 && letters.every((c) => CONFUSABLE_CHARS.has(c));
  });
}

/**
 * Analyze a URL for phishing red flags.
 * @param {string} href
 * @returns {{
 *   level: "safe"|"warn"|"danger",
 *   host: string, registrable: string, subdomain: string, rest: string,
 *   flags: { key: string, level: "ok"|"warn"|"danger", vars?: Record<string,string> }[]
 * } | null}
 */
function analyzeLink(href) {
  let u;
  try {
    u = new URL(href);
  } catch (_) {
    return null;
  }

  const flags = [];
  const asciiHost = u.hostname.toLowerCase();
  const host = decodeHostname(asciiHost);
  const { registrable, subdomain } = splitRegistrable(asciiHost);
  // Lookalike hosts are shown in their real (punycode) form — the Unicode form
  // is exactly what's designed to fool the eye.
  const lookalike = asciiHost.includes("xn--") && isLookalikeHost(host);
  const registrableShown = lookalike ? registrable : decodeHostname(registrable);
  const subdomainShown = lookalike ? subdomain : decodeHostname(subdomain);

  if (u.protocol === "javascript:" || u.protocol === "data:" || u.protocol === "vbscript:") {
    flags.push({ key: "script", level: "danger" });
  }

  if (u.username || u.password) {
    flags.push({ key: "userinfo", level: "danger", vars: { host } });
  }

  if (asciiHost.includes("xn--")) {
    if (lookalike) {
      flags.push({ key: "lookalike", level: "danger", vars: { host: asciiHost } });
    } else {
      flags.push({ key: "idn", level: "warn", vars: { host } });
    }
  }

  if (subdomain) {
    const subLabels = subdomain.split(".");
    if (subLabels.some((l) => DOMAIN_LIKE_LABELS.has(l)) && subLabels.length >= 2) {
      flags.push({ key: "subdomain", level: "danger", vars: { domain: registrableShown } });
    }
  }

  if (isIpHost(asciiHost)) flags.push({ key: "ip", level: "warn" });
  if (LINK_SHORTENERS.has(asciiHost) || LINK_SHORTENERS.has(asciiHost.replace(/^www\./, ""))) {
    flags.push({ key: "shortener", level: "warn" });
  }
  if (u.port && !["80", "443"].includes(u.port)) {
    flags.push({ key: "port", level: "warn", vars: { port: u.port } });
  }
  const ext = (u.pathname.match(RISKY_DOWNLOAD_EXT) || [])[1];
  if (ext) flags.push({ key: "download", level: "warn", vars: { ext: `.${ext.toLowerCase()}` } });

  if (u.protocol === "http:") flags.push({ key: "insecure", level: "warn" });
  else if (u.protocol === "https:" && !flags.length) flags.push({ key: "https", level: "ok" });

  const level = flags.some((f) => f.level === "danger")
    ? "danger"
    : flags.some((f) => f.level === "warn")
      ? "warn"
      : "safe";

  let rest = "";
  if (u.protocol === "http:" || u.protocol === "https:") {
    rest = `${u.port ? ":" + u.port : ""}${u.pathname === "/" ? "" : u.pathname}${u.search}${u.hash}`;
    try {
      rest = decodeURI(rest);
    } catch (_) {}
  }

  return {
    level,
    scheme: u.protocol.replace(":", ""),
    host,
    registrable: registrableShown,
    subdomain: subdomainShown,
    rest,
    flags,
  };
}
