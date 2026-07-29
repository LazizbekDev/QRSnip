// ─── QRSnip · Local Scan History ────────────────────────────────────────────

const HISTORY_KEY = "scanHistory";
const HISTORY_MAX = 50;
const SCAN_COUNT_KEY = "successfulScanCount";
const REVIEW_PROMPT_DONE_KEY = "reviewPromptDone";
const REVIEW_PROMPT_THRESHOLD = 5;
const REVIEW_URL =
  "https://chromewebstore.google.com/detail/pjecadbnlcipeofmeammkpchfgeagmmg/reviews";

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

/**
 * Count a successful scan. Returns true when the review prompt may be shown
 * (threshold reached and not yet marked done). Call markReviewPromptDone()
 * once the banner is actually displayed.
 * @returns {Promise<boolean>}
 */
async function noteSuccessfulScan() {
  const data = await chrome.storage.local.get([
    SCAN_COUNT_KEY,
    REVIEW_PROMPT_DONE_KEY,
  ]);
  if (data[REVIEW_PROMPT_DONE_KEY]) return false;

  const count = (Number(data[SCAN_COUNT_KEY]) || 0) + 1;
  await chrome.storage.local.set({ [SCAN_COUNT_KEY]: count });
  return count >= REVIEW_PROMPT_THRESHOLD;
}

/**
 * Permanently hide the review prompt after it has been shown once.
 * @returns {Promise<void>}
 */
async function markReviewPromptDone() {
  await chrome.storage.local.set({ [REVIEW_PROMPT_DONE_KEY]: true });
}
