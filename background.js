// ─── QRSnip · Background Service Worker ──────────────────────────────────────

const CROPPER_URL = () => chrome.runtime.getURL("cropper.html");

const SCAN_SESSION_KEYS = [
  "sourceTabId",
  "cropperTabId",
  "returnUrl",
  "capturedImage",
  "scanSource",
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

async function captureAndOpenCropper(tab) {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: "png",
    });
    await openCropperTab(tab, {
      capturedImage: dataUrl,
      scanSource: "capture",
    });
  } catch (err) {
    console.error("[QRSnip] Capture failed:", err);

    const isFileTab = typeof tab?.url === "string" && tab.url.startsWith("file://");
    if (isFileTab) {
      await chrome.tabs.create({
        url: `chrome://extensions/?id=${chrome.runtime.id}`,
      });
      return;
    }

    await openEmptyCropper(tab);
  }
}

async function openEmptyCropper(tab) {
  await openCropperTab(tab, { scanSource: "empty" }, { omitCapture: true });
}

async function openCropperTab(tab, sessionExtra = {}, { omitCapture = false } = {}) {
  const payload = {
    scanSource: sessionExtra.scanSource || "empty",
    sourceTabId: tab?.id ?? null,
    returnUrl: typeof tab?.url === "string" ? tab.url : "",
  };

  if (!omitCapture && sessionExtra.capturedImage) {
    payload.capturedImage = sessionExtra.capturedImage;
  } else {
    await chrome.storage.local.remove(["capturedImage"]);
  }

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

  payload.cropperTabId = cropper.id;
  await chrome.storage.local.set(payload);
}
