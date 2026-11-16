// ─── QRSnip · Local Scan History ────────────────────────────────────────────

const HISTORY_KEY = "scanHistory";
const HISTORY_MAX = 50;
const SCAN_COUNT_KEY = "successfulScanCount";
const REVIEW_PROMPT_DONE_KEY = "reviewPromptDone";
const REVIEW_PROMPT_IMPRESSIONS_KEY = "reviewPromptImpressions";
/** Ask after this many successful scans. */
const REVIEW_PROMPT_THRESHOLD = 3;
/** Stop asking after the strip was ignored in this many separate sessions. */
const REVIEW_PROMPT_MAX_IMPRESSIONS = 3;
const REVIEW_URL =
  "https://chromewebstore.google.com/detail/pjecadbnlcipeofmeammkpchfgeagmmg/reviews";
const SUPPORT_URL = "https://www.buymeacoffee.com/lazizcore";

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
 * Count a successful scan (local counter only, never leaves the device).
 * @returns {Promise<void>}
 */
async function noteSuccessfulScan() {
  const data = await chrome.storage.local.get(SCAN_COUNT_KEY);
  const count = (Number(data[SCAN_COUNT_KEY]) || 0) + 1;
  await chrome.storage.local.set({ [SCAN_COUNT_KEY]: count });
}

/**
 * True when the rate strip may be shown: enough successful scans, the user
 * has not answered it (rated / "Not now"), and it has not been ignored in
 * too many sessions already. Asked of every user — no sentiment gating.
 * @returns {Promise<boolean>}
 */
async function shouldShowReviewPrompt() {
  const data = await chrome.storage.local.get([
    SCAN_COUNT_KEY,
    REVIEW_PROMPT_DONE_KEY,
    REVIEW_PROMPT_IMPRESSIONS_KEY,
  ]);
  if (data[REVIEW_PROMPT_DONE_KEY]) return false;
  if ((Number(data[REVIEW_PROMPT_IMPRESSIONS_KEY]) || 0) >= REVIEW_PROMPT_MAX_IMPRESSIONS) {
    return false;
  }
  return (Number(data[SCAN_COUNT_KEY]) || 0) >= REVIEW_PROMPT_THRESHOLD;
}

/**
 * Record that the strip was seen in one scanner session (call once per session).
 * @returns {Promise<void>}
 */
async function noteReviewPromptImpression() {
  const data = await chrome.storage.local.get(REVIEW_PROMPT_IMPRESSIONS_KEY);
  const n = (Number(data[REVIEW_PROMPT_IMPRESSIONS_KEY]) || 0) + 1;
  await chrome.storage.local.set({ [REVIEW_PROMPT_IMPRESSIONS_KEY]: n });
}

/**
 * Never ask again — called only when the user explicitly rates or declines.
 * @returns {Promise<void>}
 */
async function markReviewPromptDone() {
  await chrome.storage.local.set({ [REVIEW_PROMPT_DONE_KEY]: true });
}
