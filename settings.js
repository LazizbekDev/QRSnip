// ─── QRSnip · Local Settings ────────────────────────────────────────────────

const SETTINGS_KEY = "qrsnipSettings";

const DEFAULT_SETTINGS = {
  autoScanEnabled: true,
  manualSnipEnabled: true,
  language: "auto",
};

const ALLOWED_LANGUAGES = [
  "auto",
  "en",
  "ja",
  "zh",
  "ru",
  "de",
  "uz",
  "hi",
  "id",
  "th",
  "fr",
  "es",
  "ar",
  "fa",
];

/**
 * @returns {Promise<{ autoScanEnabled: boolean, manualSnipEnabled: boolean, language: string }>}
 */
async function getSettings() {
  const data = await chrome.storage.local.get(SETTINGS_KEY);
  const raw = data[SETTINGS_KEY];
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_SETTINGS };
  }
  const lang = typeof raw.language === "string" ? raw.language : "auto";
  return {
    autoScanEnabled: raw.autoScanEnabled !== false,
    manualSnipEnabled: raw.manualSnipEnabled !== false,
    language: ALLOWED_LANGUAGES.includes(lang) ? lang : "auto",
  };
}

/**
 * @param {boolean} value
 */
async function setAutoScanEnabled(value) {
  const next = { ...(await getSettings()), autoScanEnabled: Boolean(value) };
  await chrome.storage.local.set({ [SETTINGS_KEY]: next });
  return next;
}

/**
 * @param {boolean} value
 */
async function setManualSnipEnabled(value) {
  const next = { ...(await getSettings()), manualSnipEnabled: Boolean(value) };
  await chrome.storage.local.set({ [SETTINGS_KEY]: next });
  return next;
}

/**
 * @param {string} value - auto | en | ja | zh | ru | de | uz | hi | id | th | fr | es | ar | fa
 */
async function setLanguage(value) {
  const language = ALLOWED_LANGUAGES.includes(value) ? value : "auto";
  const next = { ...(await getSettings()), language };
  await chrome.storage.local.set({ [SETTINGS_KEY]: next });
  return next;
}
