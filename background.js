// ─── QRSnip · Background Service Worker ──────────────────────────────────────

const CROPPER_URL = () => chrome.runtime.getURL("cropper.html");

const SCAN_SESSION_KEYS = [
  "sourceTabId",
  "cropperTabId",
  "returnUrl",
  "capturedImage",
  "scanSource",
  "openHint",
];

// Optional one-question survey shown by Chrome after uninstall. Only the
// extension version and browser UI language are passed — no IDs, no usage data.
const UNINSTALL_SURVEY_URL = "https://lazizbekdev.github.io/QRSnip/uninstall.html";

function registerUninstallSurvey() {
  const q = new URLSearchParams({
    v: chrome.runtime.getManifest().version,
    lang: chrome.i18n.getUILanguage(),
  });
  chrome.runtime.setUninstallURL(`${UNINSTALL_SURVEY_URL}?${q}`).catch((err) => {
    console.warn("[QRSnip] setUninstallURL failed:", err);
  });
}

registerUninstallSurvey();

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "qrsnip-scan-image",
      title: chrome.i18n.getMessage("contextMenuScan") || "Scan with QRSnip",
      contexts: ["image"],
    });
  });
});

async function activateFromTab(tab) {
  if (!tab?.id) return;
  await captureAndOpenCropper(tab);
}

chrome.action.onClicked.addListener((tab) => {
  void activateFromTab(tab);
});

// _execute_action (keyboard shortcut) triggers chrome.action.onClicked in production.

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "qrsnip-scan-image") return;
  if (tab?.id) await captureAndOpenCropper(tab);
  else await openEmptyCropper();
});

async function clearScanSession() {
  await chrome.storage.local.remove(SCAN_SESSION_KEYS);
}

async function focusSourceTab() {
  const { sourceTabId } = await chrome.storage.local.get("sourceTabId");
  if (!sourceTabId) return;
  try {
    await chrome.tabs.update(sourceTabId, { active: true });
  } catch (err) {
    console.warn("[QRSnip] Could not focus source tab:", err);
  }
}

async function closeCropperSession(cropperTabId) {
  const { cropperTabId: storedCropperId, sourceTabId } = await chrome.storage.local.get([
    "cropperTabId",
    "sourceTabId",
  ]);
  const tabToClose = storedCropperId ?? cropperTabId;

  await focusSourceTab();

  if (tabToClose && tabToClose !== sourceTabId) {
    try {
      await chrome.tabs.remove(tabToClose);
    } catch (_) {
      // Tab may already be closed (e.g. user clicked X).
    }
  }

  await clearScanSession();
}

chrome.tabs.onRemoved.addListener((tabId) => {
  void (async () => {
    const { cropperTabId } = await chrome.storage.local.get("cropperTabId");
    if (cropperTabId !== tabId) return;
    await focusSourceTab();
    await clearScanSession();
  })();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "qrsnip-close") {
    void closeCropperSession(sender.tab?.id).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === "qrsnip-retry") {
    void retryCapture(sender.tab?.id)
      .then(sendResponse)
      .catch((err) => {
        console.error("[QRSnip] Retry failed:", err);
        sendResponse({ ok: false });
      });
    return true;
  }
});

/**
 * Why a URL can never be captured by an extension, or null if it can.
 * Shown to the user as a specific explanation instead of a black screen.
 * @param {string|undefined} url
 * @returns {null|"webstore"|"browser_page"|"extension_page"}
 */
function classifyRestrictedUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const u = new URL(url);
    const proto = u.protocol;
    if (
      [
        "chrome:",
        "brave:",
        "edge:",
        "opera:",
        "vivaldi:",
        "arc:",
        "about:",
        "chrome-search:",
        "chrome-untrusted:",
        "chrome-native:",
        "devtools:",
        "view-source:",
      ].includes(proto)
    ) {
      return "browser_page";
    }
    if (proto === "chrome-extension:" || proto === "extension:") return "extension_page";
    const host = u.hostname;
    if (host === "chromewebstore.google.com") return "webstore";
    if (host === "chrome.google.com" && u.pathname.startsWith("/webstore")) return "webstore";
    if (host === "microsoftedge.microsoft.com" && u.pathname.startsWith("/addons")) return "webstore";
  } catch (_) {
    return null;
  }
  return null;
}

/**
 * Map a captureVisibleTab error to a user-facing reason.
 * @param {unknown} err
 * @returns {"webstore"|"browser_page"|"policy"|"rate"|"no_access"|"capture_failed"}
 */
function classifyCaptureError(err) {
  const msg = String(err?.message || err || "");
  if (/gallery cannot be scripted|webstore/i.test(msg)) return "webstore";
  if (/cannot access a [a-z-]+:\/\/ url|chrome:\/\/|edge:\/\/|brave:\/\//i.test(msg)) return "browser_page";
  if (/policy|runtime_blocked_hosts/i.test(msg)) return "policy";
  if (/MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND/i.test(msg)) return "rate";
  if (/cannot access|activeTab|permission|not allowed/i.test(msg)) return "no_access";
  return "capture_failed";
}

/**
 * Prefer JPEG to reduce chrome.storage.local quota pressure on large / HiDPI screens.
 * @param {number} windowId
 * @param {number} [quality]
 * @returns {Promise<string>}
 */
async function captureVisibleTabDataUrl(windowId, quality = 92) {
  try {
    return await chrome.tabs.captureVisibleTab(windowId, {
      format: "jpeg",
      quality,
    });
  } catch (err) {
    if (classifyCaptureError(err) !== "capture_failed") throw err;
    return await chrome.tabs.captureVisibleTab(windowId, { format: "png" });
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function isFileAccessAllowed() {
  try {
    return await chrome.extension.isAllowedFileSchemeAccess();
  } catch (_) {
    return true;
  }
}

/**
 * Capture the tab and write the cropper session (image, or a reason hint).
 * Never opens a tab.
 * @param {chrome.tabs.Tab} tab
 */
async function captureToSession(tab) {
  const isFileTab = typeof tab?.url === "string" && tab.url.startsWith("file://");

  const restricted = classifyRestrictedUrl(tab?.url);
  if (restricted) {
    await persistCropperSession(tab, { scanSource: "empty", openHint: restricted }, { omitCapture: true });
    return;
  }

  if (isFileTab && !(await isFileAccessAllowed())) {
    await persistCropperSession(tab, { scanSource: "empty", openHint: "file_access" }, { omitCapture: true });
    return;
  }

  let dataUrl;
  try {
    try {
      dataUrl = await captureVisibleTabDataUrl(tab.windowId, 92);
    } catch (err) {
      // Chrome rate-limits captures to ~2/s; one patient retry is enough.
      if (classifyCaptureError(err) !== "rate") throw err;
      await sleep(650);
      dataUrl = await captureVisibleTabDataUrl(tab.windowId, 92);
    }
  } catch (err) {
    console.error("[QRSnip] Capture failed:", err);
    let reason = classifyCaptureError(err);
    if (reason === "rate") reason = "capture_failed";
    if (isFileTab) reason = "file_access";
    await persistCropperSession(tab, { scanSource: "empty", openHint: reason }, { omitCapture: true });
    return;
  }

  try {
    await persistCropperSession(tab, { capturedImage: dataUrl, scanSource: "capture" });
  } catch (storeErr) {
    console.warn("[QRSnip] Storage set failed, retrying smaller capture:", storeErr);
    try {
      dataUrl = await captureVisibleTabDataUrl(tab.windowId, 72);
      await persistCropperSession(tab, { capturedImage: dataUrl, scanSource: "capture" });
    } catch (storeErr2) {
      console.error("[QRSnip] Storage quota exhausted:", storeErr2);
      await persistCropperSession(tab, { scanSource: "empty", openHint: "quota" }, { omitCapture: true });
    }
  }
}

async function captureAndOpenCropper(tab) {
  await captureToSession(tab);
  await createCropperTab(tab);
}

/**
 * "Try again" from the cropper's notice card: briefly re-focus the source tab,
 * re-capture it, then reload the cropper with the fresh result.
 * @param {number|undefined} senderTabId
 */
async function retryCapture(senderTabId) {
  const { sourceTabId, cropperTabId } = await chrome.storage.local.get([
    "sourceTabId",
    "cropperTabId",
  ]);
  const cropperId = cropperTabId ?? senderTabId;
  let tab;
  try {
    tab = await chrome.tabs.get(sourceTabId);
  } catch (_) {
    return { ok: false, reason: "source_gone" };
  }

  await chrome.tabs.update(tab.id, { active: true });
  await sleep(350);
  tab = await chrome.tabs.get(tab.id);
  await captureToSession(tab);

  if (cropperId) {
    try {
      await chrome.tabs.update(cropperId, { active: true });
      await chrome.tabs.reload(cropperId);
    } catch (_) {
      await createCropperTab(tab);
    }
  }
  return { ok: true };
}

async function openEmptyCropper(tab) {
  await openCropperTab(tab, { scanSource: "empty" }, { omitCapture: true });
}

/**
 * Build session payload and write storage (image first) — does not open the tab.
 */
async function persistCropperSession(tab, sessionExtra = {}, { omitCapture = false } = {}) {
  const payload = {
    scanSource: sessionExtra.scanSource || "empty",
    sourceTabId: tab?.id ?? null,
    returnUrl: typeof tab?.url === "string" ? tab.url : "",
  };

  if (sessionExtra.openHint) {
    payload.openHint = sessionExtra.openHint;
  } else {
    await chrome.storage.local.remove(["openHint"]);
  }

  if (!omitCapture && sessionExtra.capturedImage) {
    payload.capturedImage = sessionExtra.capturedImage;
  } else {
    await chrome.storage.local.remove(["capturedImage"]);
  }

  await chrome.storage.local.set(payload);
  return payload;
}

async function createCropperTab(tab) {
  let cropper;
  if (!tab?.id) {
    cropper = await chrome.tabs.create({ url: CROPPER_URL(), active: true });
  } else {
    cropper = await chrome.tabs.create({
      url: CROPPER_URL(),
      index: tab.index + 1,
      active: true,
    });
  }
  await chrome.storage.local.set({ cropperTabId: cropper.id });
  return cropper;
}

/**
 * Persist session *before* opening the cropper tab so the page never races an empty read.
 */
async function openCropperTab(tab, sessionExtra = {}, { omitCapture = false } = {}) {
  await persistCropperSession(tab, sessionExtra, { omitCapture });
  await createCropperTab(tab);
}
