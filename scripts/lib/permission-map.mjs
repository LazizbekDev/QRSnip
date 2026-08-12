/**
 * Maps Chrome extension permissions to source-code detection rules.
 * Zero-deps; used by check-unused-permissions.mjs
 *
 * Each API permission entry:
 *   patterns: RegExp[] — if any matches source text, permission is "used"
 *   reason: short label shown in the report when matched
 *
 * Host permissions are handled separately (inconclusive by default).
 */

/** @typedef {{ patterns: RegExp[], reason: string }} DetectRule */

/** @type {Record<string, DetectRule>} */
export const PERMISSION_RULES = {
  // ── Storage ──────────────────────────────────────────────────────────────
  storage: {
    reason: "chrome.storage",
    patterns: [
      /\bchrome\.storage\b/,
      /\bbrowser\.storage\b/,
    ],
  },

  // ── Context menus ────────────────────────────────────────────────────────
  contextMenus: {
    reason: "chrome.contextMenus",
    patterns: [
      /\bchrome\.contextMenus\b/,
      /\bbrowser\.contextMenus\b/,
      /\bchrome\.contextMenus\./,
    ],
  },

  // ── Tabs (explicit permission) ───────────────────────────────────────────
  tabs: {
    reason: "chrome.tabs",
    patterns: [
      /\bchrome\.tabs\./,
      /\bbrowser\.tabs\./,
    ],
  },

  // ── activeTab (user-gesture temporary access) ────────────────────────────
  activeTab: {
    reason: "captureVisibleTab / scripting on active tab",
    patterns: [
      /\bchrome\.tabs\.captureVisibleTab\b/,
      /\bbrowser\.tabs\.captureVisibleTab\b/,
      /\bchrome\.scripting\.(executeScript|insertCSS|removeCSS)\b/,
      /\bbrowser\.scripting\.(executeScript|insertCSS|removeCSS)\b/,
    ],
  },

  scripting: {
    reason: "chrome.scripting",
    patterns: [
      /\bchrome\.scripting\b/,
      /\bbrowser\.scripting\b/,
    ],
  },

  // ── Common API permissions (1:1 with chrome.* namespace) ─────────────────
  alarms: {
    reason: "chrome.alarms",
    patterns: [/\bchrome\.alarms\b/, /\bbrowser\.alarms\b/],
  },
  bookmarks: {
    reason: "chrome.bookmarks",
    patterns: [/\bchrome\.bookmarks\b/, /\bbrowser\.bookmarks\b/],
  },
  browsingData: {
    reason: "chrome.browsingData",
    patterns: [/\bchrome\.browsingData\b/, /\bbrowser\.browsingData\b/],
  },
  clipboardRead: {
    reason: "clipboard read",
    patterns: [
      /\bnavigator\.clipboard\.read/,
      /\bclipboardRead\b/,
      /\bdocument\.execCommand\s*\(\s*['"]paste['"]/,
    ],
  },
  clipboardWrite: {
    reason: "clipboard write",
    patterns: [
      /\bnavigator\.clipboard\.write/,
      /\bclipboardWrite\b/,
      /\bdocument\.execCommand\s*\(\s*['"]copy['"]/,
    ],
  },
  cookies: {
    reason: "chrome.cookies",
    patterns: [/\bchrome\.cookies\b/, /\bbrowser\.cookies\b/],
  },
  declarativeNetRequest: {
    reason: "chrome.declarativeNetRequest",
    patterns: [
      /\bchrome\.declarativeNetRequest\b/,
      /\bbrowser\.declarativeNetRequest\b/,
    ],
  },
  declarativeNetRequestWithHostAccess: {
    reason: "chrome.declarativeNetRequest (host access)",
    patterns: [
      /\bchrome\.declarativeNetRequest\b/,
      /\bbrowser\.declarativeNetRequest\b/,
    ],
  },
  declarativeNetRequestFeedback: {
    reason: "chrome.declarativeNetRequest feedback",
    patterns: [
      /\bchrome\.declarativeNetRequest\b/,
      /\bonRuleMatchedDebug\b/,
    ],
  },
  downloads: {
    reason: "chrome.downloads",
    patterns: [/\bchrome\.downloads\b/, /\bbrowser\.downloads\b/],
  },
  fontSettings: {
    reason: "chrome.fontSettings",
    patterns: [/\bchrome\.fontSettings\b/, /\bbrowser\.fontSettings\b/],
  },
  geolocation: {
    reason: "geolocation",
    patterns: [
      /\bnavigator\.geolocation\b/,
      /\bchrome\.geolocation\b/,
    ],
  },
  history: {
    reason: "chrome.history",
    patterns: [/\bchrome\.history\b/, /\bbrowser\.history\b/],
  },
  identity: {
    reason: "chrome.identity",
    patterns: [/\bchrome\.identity\b/, /\bbrowser\.identity\b/],
  },
  idle: {
    reason: "chrome.idle",
    patterns: [/\bchrome\.idle\b/, /\bbrowser\.idle\b/],
  },
  management: {
    reason: "chrome.management",
    patterns: [/\bchrome\.management\b/, /\bbrowser\.management\b/],
  },
  nativeMessaging: {
    reason: "chrome.runtime.connectNative / sendNativeMessage",
    patterns: [
      /\bchrome\.runtime\.connectNative\b/,
      /\bchrome\.runtime\.sendNativeMessage\b/,
      /\bbrowser\.runtime\.connectNative\b/,
      /\bbrowser\.runtime\.sendNativeMessage\b/,
    ],
  },
  notifications: {
    reason: "chrome.notifications",
    patterns: [/\bchrome\.notifications\b/, /\bbrowser\.notifications\b/],
  },
  offscreen: {
    reason: "chrome.offscreen",
    patterns: [/\bchrome\.offscreen\b/, /\bbrowser\.offscreen\b/],
  },
  pageCapture: {
    reason: "chrome.pageCapture",
    patterns: [/\bchrome\.pageCapture\b/, /\bbrowser\.pageCapture\b/],
  },
  power: {
    reason: "chrome.power",
    patterns: [/\bchrome\.power\b/, /\bbrowser\.power\b/],
  },
  privacy: {
    reason: "chrome.privacy",
    patterns: [/\bchrome\.privacy\b/, /\bbrowser\.privacy\b/],
  },
  proxy: {
    reason: "chrome.proxy",
    patterns: [/\bchrome\.proxy\b/, /\bbrowser\.proxy\b/],
  },
  readingList: {
    reason: "chrome.readingList",
    patterns: [/\bchrome\.readingList\b/, /\bbrowser\.readingList\b/],
  },
  searches: {
    reason: "chrome.search",
    patterns: [/\bchrome\.search\b/, /\bbrowser\.search\b/],
  },
  search: {
    reason: "chrome.search",
    patterns: [/\bchrome\.search\b/, /\bbrowser\.search\b/],
  },
  sessions: {
    reason: "chrome.sessions",
    patterns: [/\bchrome\.sessions\b/, /\bbrowser\.sessions\b/],
  },
  sidePanel: {
    reason: "chrome.sidePanel",
    patterns: [/\bchrome\.sidePanel\b/, /\bbrowser\.sidePanel\b/],
  },
  tabCapture: {
    reason: "chrome.tabCapture",
    patterns: [/\bchrome\.tabCapture\b/, /\bbrowser\.tabCapture\b/],
  },
  tabGroups: {
    reason: "chrome.tabGroups",
    patterns: [/\bchrome\.tabGroups\b/, /\bbrowser\.tabGroups\b/],
  },
  topSites: {
    reason: "chrome.topSites",
    patterns: [/\bchrome\.topSites\b/, /\bbrowser\.topSites\b/],
  },
  tts: {
    reason: "chrome.tts",
    patterns: [/\bchrome\.tts\b/, /\bbrowser\.tts\b/],
  },
  ttsEngine: {
    reason: "chrome.ttsEngine",
    patterns: [/\bchrome\.ttsEngine\b/, /\bbrowser\.ttsEngine\b/],
  },
  unlimitedStorage: {
    reason: "chrome.storage (unlimitedStorage)",
    patterns: [/\bchrome\.storage\b/, /\bbrowser\.storage\b/],
  },
  wallpaper: {
    reason: "chrome.wallpaper",
    patterns: [/\bchrome\.wallpaper\b/, /\bbrowser\.wallpaper\b/],
  },
  webNavigation: {
    reason: "chrome.webNavigation",
    patterns: [/\bchrome\.webNavigation\b/, /\bbrowser\.webNavigation\b/],
  },
  webRequest: {
    reason: "chrome.webRequest",
    patterns: [/\bchrome\.webRequest\b/, /\bbrowser\.webRequest\b/],
  },
  webRequestBlocking: {
    reason: "chrome.webRequest (blocking)",
    patterns: [/\bchrome\.webRequest\b/, /\bbrowser\.webRequest\b/],
  },
  desktopCapture: {
    reason: "chrome.desktopCapture",
    patterns: [/\bchrome\.desktopCapture\b/, /\bbrowser\.desktopCapture\b/],
  },
  system: {
    reason: "chrome.system",
    patterns: [/\bchrome\.system\b/, /\bbrowser\.system\b/],
  },
  "system.cpu": {
    reason: "chrome.system.cpu",
    patterns: [/\bchrome\.system\.cpu\b/, /\bbrowser\.system\.cpu\b/],
  },
  "system.memory": {
    reason: "chrome.system.memory",
    patterns: [/\bchrome\.system\.memory\b/, /\bbrowser\.system\.memory\b/],
  },
  "system.storage": {
    reason: "chrome.system.storage",
    patterns: [/\bchrome\.system\.storage\b/, /\bbrowser\.system\.storage\b/],
  },
  "system.display": {
    reason: "chrome.system.display",
    patterns: [/\bchrome\.system\.display\b/, /\bbrowser\.system\.display\b/],
  },
};

/**
 * Fallback: permission name matches chrome.<permission> namespace.
 * @param {string} permission
 * @param {string} source
 * @returns {{ used: boolean, reason?: string }}
 */
export function matchPermission(permission, source) {
  const rule = PERMISSION_RULES[permission];
  if (rule) {
    for (const re of rule.patterns) {
      if (re.test(source)) {
        return { used: true, reason: rule.reason };
      }
    }
    return { used: false };
  }

  // Unknown permission — try chrome.<name> / browser.<name>
  const safe = permission.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const ns = new RegExp(`\\b(?:chrome|browser)\\.${safe}\\b`);
  if (ns.test(source)) {
    return { used: true, reason: `chrome.${permission}` };
  }
  return { used: false };
}

/**
 * Host permission hints (never definitive "unused").
 * @param {string} hostPattern
 * @param {string} source
 * @returns {"matched" | "inconclusive"}
 */
export function matchHostPermission(hostPattern, source) {
  const escaped = hostPattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(escaped).test(source)) return "matched";

  // Common fragments
  if (hostPattern.startsWith("file:") && /file:\/\//.test(source)) return "matched";
  if (hostPattern === "<all_urls>" && /<all_urls>/.test(source)) return "matched";
  if (
    (hostPattern.includes("://") || hostPattern.startsWith("*")) &&
    (/\bfetch\s*\(/.test(source) ||
      /\bXMLHttpRequest\b/.test(source) ||
      /\bchrome\.tabs\.(create|update|query)\b/.test(source))
  ) {
    return "inconclusive";
  }

  return "inconclusive";
}
