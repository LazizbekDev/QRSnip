// ─── QRSnip · Local Settings ────────────────────────────────────────────────

const SETTINGS_KEY = "qrsnipSettings";

const DEFAULT_SETTINGS = {
  autoScanEnabled: true,
  manualSnipEnabled: true,
};

/**
 * @returns {Promise<{ autoScanEnabled: boolean, manualSnipEnabled: boolean }>}
 */
async function getSettings() {
  const data = await chrome.storage.local.get(SETTINGS_KEY);
  const raw = data[SETTINGS_KEY];
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_SETTINGS };
  }
  return {
    autoScanEnabled: raw.autoScanEnabled !== false,
    manualSnipEnabled: raw.manualSnipEnabled !== false,
  };
}

/**
 * @param {boolean} value
 * @returns {Promise<{ autoScanEnabled: boolean, manualSnipEnabled: boolean }>}
 */
async function setAutoScanEnabled(value) {
  const next = { ...(await getSettings()), autoScanEnabled: Boolean(value) };
  await chrome.storage.local.set({ [SETTINGS_KEY]: next });
  return next;
}

/**
 * @param {boolean} value
 * @returns {Promise<{ autoScanEnabled: boolean, manualSnipEnabled: boolean }>}
 */
async function setManualSnipEnabled(value) {
  const next = { ...(await getSettings()), manualSnipEnabled: Boolean(value) };
  await chrome.storage.local.set({ [SETTINGS_KEY]: next });
  return next;
}
