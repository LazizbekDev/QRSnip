// ─── QRSnip · Background Service Worker ──────────────────────────────────────

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  try {
    // 1. Capture the full visible tab as a PNG data URL
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: "png",
    });

    // 2. Save to local storage
    await chrome.storage.local.set({ capturedImage: dataUrl });

    // 3. Open cropper.html in a new tab right next to the active one
    await chrome.tabs.create({
      url: chrome.runtime.getURL("cropper.html"),
      index: tab.index + 1,
    });
  } catch (err) {
    console.error("[QRSnip] Capture failed:", err);
    
    // Fallback: If capture fails on a file:// URL, the user needs to enable access.
    if (tab.url && tab.url.startsWith("file://")) {
      // Direct them to the extension management page
      await chrome.tabs.create({ 
        url: "chrome://extensions/?id=" + chrome.runtime.id 
      });
      console.warn("Please enable 'Allow access to file URLs' to scan local files.");
    }
  }
});