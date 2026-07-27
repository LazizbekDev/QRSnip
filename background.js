// ─── QRSnip · Background Service Worker ──────────────────────────────────────

const CROPPER_URL = () => chrome.runtime.getURL("cropper.html");

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "qrsnip-scan-image",
      title: "Scan with QRSnip",
      contexts: ["image"],
    });
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;
  await captureAndOpenCropper(tab);
});

// activeTab is granted on context-menu click — capture the visible tab, then snip
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "qrsnip-scan-image") return;
  if (tab?.id) await captureAndOpenCropper(tab);
  else await openEmptyCropper();
});

async function captureAndOpenCropper(tab) {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: "png",
    });
    await chrome.storage.local.set({
      capturedImage: dataUrl,
      scanSource: "capture",
    });
    await openCropperTab(tab);
  } catch (err) {
    console.error("[QRSnip] Capture failed:", err);

    // Local PDFs/images (file://) need "Allow access to file URLs" enabled
    const isFileTab = typeof tab?.url === "string" && tab.url.startsWith("file://");
    if (isFileTab) {
      await chrome.tabs.create({
        url: `chrome://extensions/?id=${chrome.runtime.id}`,
      });
      return;
    }

    // Restricted pages (chrome://, Web Store, etc.) — allow drop/paste instead
    await openEmptyCropper(tab);
  }
}

async function openEmptyCropper(tab) {
  await chrome.storage.local.remove(["capturedImage"]);
  await chrome.storage.local.set({ scanSource: "empty" });
  await openCropperTab(tab);
}

async function openCropperTab(tab) {
  await chrome.tabs.create({
    url: CROPPER_URL(),
    index: tab?.index != null ? tab.index + 1 : undefined,
    active: true,
  });
}
