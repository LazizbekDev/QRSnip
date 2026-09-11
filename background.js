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
  if (msg.type !== "qrsnip-close") return;
  void closeCropperSession(sender.tab?.id).then(() => sendResponse({ ok: true }));
  return true;
});

/**
 * Pages Chrome cannot capture (chrome://, Web Store, extension pages, etc.).
 * @param {string|undefined} url
 * @returns {boolean}
 */
function isRestrictedCaptureUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const u = new URL(url);
    const proto = u.protocol;
    if (
      proto === "chrome:" ||
      proto === "chrome-extension:" ||
      proto === "edge:" ||
      proto === "about:" ||
      proto === "devtools:" ||
      proto === "view-source:"
    ) {
      return true;
    }
    const host = u.hostname;
    if (host === "chromewebstore.google.com") return true;
    if (host === "chrome.google.com" && u.pathname.includes("/webstore")) return true;
  } catch (_) {
    return false;
  }
  return false;
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
  } catch (_) {
    return await chrome.tabs.captureVisibleTab(windowId, { format: "png" });
  }
}

async function captureAndOpenCropper(tab) {
  const isFileTab = typeof tab?.url === "string" && tab.url.startsWith("file://");

  if (isRestrictedCaptureUrl(tab?.url)) {
    await openCropperTab(tab, { scanSource: "empty", openHint: "restricted" }, { omitCapture: true });
    return;
  }

  try {
    let dataUrl = await captureVisibleTabDataUrl(tab.windowId, 92);
    try {
      await persistCropperSession(tab, {
        capturedImage: dataUrl,
        scanSource: "capture",
      });
    } catch (storeErr) {
      console.warn("[QRSnip] Storage set failed, retrying smaller capture:", storeErr);
      dataUrl = await captureVisibleTabDataUrl(tab.windowId, 72);
      try {
        await persistCropperSession(tab, {
          capturedImage: dataUrl,
          scanSource: "capture",
        });
      } catch (storeErr2) {
        console.error("[QRSnip] Storage quota exhausted:", storeErr2);
        await openCropperTab(
          tab,
          { scanSource: "empty", openHint: "quota" },
          { omitCapture: true }
        );
        return;
      }
    }
    await createCropperTab(tab);
  } catch (err) {
    console.error("[QRSnip] Capture failed:", err);

    if (isFileTab) {
      await chrome.tabs.create({
        url: `chrome://extensions/?id=${chrome.runtime.id}`,
      });
      return;
    }

    await openCropperTab(
      tab,
      { scanSource: "empty", openHint: "capture_failed" },
      { omitCapture: true }
    );
  }
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
