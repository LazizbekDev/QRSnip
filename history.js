// ─── QRSnip · Local Scan History ────────────────────────────────────────────

const HISTORY_KEY = "scanHistory";
const HISTORY_MAX = 50;

/**
 * @typedef {{ id: string, timestamp: number, format: string, type: string, raw: string, preview: string }} HistoryEntry
 */

/**
 * @returns {Promise<HistoryEntry[]>}
 */
async function getHistory() {
  const data = await chrome.storage.local.get(HISTORY_KEY);
  return Array.isArray(data[HISTORY_KEY]) ? data[HISTORY_KEY] : [];
}

/**
 * @param {{ format: string, type: string, raw: string }} entry
 * @returns {Promise<HistoryEntry[]>}
 */
async function addHistoryEntry({ format, type, raw }) {
  const list = await getHistory();
  const preview = (raw || "").replace(/\s+/g, " ").trim().slice(0, 120);
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    format: format || "unknown",
    type: type || "text",
    raw: raw || "",
    preview,
  };
  const next = [item, ...list.filter((e) => e.raw !== item.raw)].slice(0, HISTORY_MAX);
  await chrome.storage.local.set({ [HISTORY_KEY]: next });
  return next;
}

/**
 * @returns {Promise<void>}
 */
async function clearHistory() {
  await chrome.storage.local.set({ [HISTORY_KEY]: [] });
}

/**
 * @param {string} id
 * @returns {Promise<HistoryEntry[]>}
 */
async function removeHistoryEntry(id) {
  const list = await getHistory();
  const next = list.filter((e) => e.id !== id);
  await chrome.storage.local.set({ [HISTORY_KEY]: next });
  return next;
}
