// ─── QRSnip · Cropper Interface ─────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  const data = await chrome.storage.local.get(["capturedImage", "scanSource"]);
  const bgImg = document.getElementById("screenshot-bg");

  if (!data.capturedImage) {
    // Empty state — allow drop/paste without a prior capture
    bgImg.style.display = "none";
    document.body.classList.add("qrs-empty");
    void initSnip({ empty: true });
    return;
  }

  bgImg.onload = () => {
    void initSnip({ empty: false });
  };
  bgImg.onerror = () => {
    showBootstrapToast("Failed to load screenshot.");
    void initSnip({ empty: true });
  };
  bgImg.src = data.capturedImage;

  // Clear transient capture after load so storage stays lean
  chrome.storage.local.remove(["capturedImage", "scanSource"]);
});

function showBootstrapToast(message) {
  // Minimal toast before initSnip exists
  console.warn("[QRSnip]", message);
}

function initSnip({ empty }) {
  let overlay = null;
  let isSelecting = false;
  let startX = 0;
  let startY = 0;
  let selBox = null;
  let guideLines = null;
  let modalOpen = false;
  let historyOpen = false;
  let settingsOpen = false;
  let autoScanEnabled = true;
  let manualSnipEnabled = true;
  let autoScanRunning = false;
  let autoscanFoundCodes = false;
  let currentResults = [];
  let pendingReviewPrompt = false;
  let keyHandler = null;

  void getSettings().then((s) => {
    autoScanEnabled = s.autoScanEnabled;
    manualSnipEnabled = s.manualSnipEnabled;
    syncOverlaySnipState();
    if (!empty && autoScanEnabled) void runAutoScan();
  });

  buildOverlay();
  bindGlobalDropPaste();
  initDecoder().catch((err) => {
    console.error("[QRSnip] Decoder init failed:", err);
    showToast("Barcode decoder unavailable in this browser.", "error");
  });

  // ─── Overlay ─────────────────────────────────────────────────────────────
  function buildOverlay() {
    overlay = document.createElement("div");
    overlay.id = "qrs-overlay";
    overlay.className = "qrs-overlay--enter";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "QRSnip — draw a selection");

    guideLines = document.createElement("div");
    guideLines.id = "qrs-guides";
    guideLines.innerHTML = `<div class="qrs-guide-h"></div><div class="qrs-guide-v"></div>`;
    overlay.appendChild(guideLines);

    // Bottom dock — pill glass bar
    const dock = document.createElement("div");
    dock.id = "qrs-dock";
    dock.innerHTML = `
      <span class="qrs-dock-hint" id="qrs-dock-hint">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 7V5a2 2 0 012-2h2"/><path d="M17 3h2a2 2 0 012 2v2"/><path d="M21 17v2a2 2 0 01-2 2h-2"/><path d="M7 21H5a2 2 0 01-2-2v-2"/>
        </svg>
        ${
          empty
            ? "Drop or paste an image"
            : "Drag around a code to scan"
        }
      </span>
      <span class="qrs-dock-sep" aria-hidden="true"></span>
      <kbd class="qrs-kbd">Esc</kbd>
      <span class="qrs-dock-muted">Cancel</span>
      <span class="qrs-dock-spacer"></span>
      <button type="button" class="qrs-tool-btn" id="qrs-history-btn" title="Scan history">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>
        </svg>
        History
      </button>
      <button type="button" class="qrs-tool-btn" id="qrs-settings-btn" title="Settings">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        Settings
      </button>
      <button type="button" class="qrs-tool-btn qrs-tool-btn--icon" id="qrs-close-tool" title="Close" aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;
    overlay.appendChild(dock);

    selBox = document.createElement("div");
    selBox.id = "qrs-selbox";
    selBox.innerHTML = `
      <span class="qrs-sel-corner qrs-sel-corner--tl" aria-hidden="true"></span>
      <span class="qrs-sel-corner qrs-sel-corner--tr" aria-hidden="true"></span>
      <span class="qrs-sel-corner qrs-sel-corner--bl" aria-hidden="true"></span>
      <span class="qrs-sel-corner qrs-sel-corner--br" aria-hidden="true"></span>
    `;
    overlay.appendChild(selBox);

    document.documentElement.appendChild(overlay);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => overlay.classList.add("qrs-overlay--visible"));
    });

    overlay.addEventListener("mousedown", onMouseDown);
    overlay.addEventListener("mousemove", onMouseMove);
    overlay.addEventListener("mouseup", onMouseUp);
    keyHandler = onKeyDown;
    document.addEventListener("keydown", keyHandler);

    document.getElementById("qrs-history-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      openHistoryPanel();
    });
    document.getElementById("qrs-settings-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      openSettingsPanel();
    });
    document.getElementById("qrs-close-tool").addEventListener("click", (e) => {
      e.stopPropagation();
      closeWindow();
    });
  }

  function closeWindow() {
    chrome.runtime.sendMessage({ type: "qrsnip-close" }, () => {
      if (chrome.runtime.lastError) {
        window.close();
      }
    });
  }

  function canManualSnip() {
    if (!autoScanEnabled) return true;
    if (!manualSnipEnabled && autoscanFoundCodes) return false;
    return true;
  }

  function syncOverlaySnipState() {
    if (!overlay) return;
    overlay.classList.toggle("qrs-overlay--nosnip", !canManualSnip());
    if (!canManualSnip()) {
      overlay.classList.remove("qrs-overlay--selecting");
      selBox?.classList.remove("qrs-selbox--active");
    }
  }

  // ─── Mouse ───────────────────────────────────────────────────────────────
  function onMouseDown(e) {
    if (modalOpen || historyOpen || settingsOpen) return;
    if (
      e.target.closest("#qrs-dock") ||
      e.target.closest("#qrs-history-panel") ||
      e.target.closest("#qrs-settings-panel") ||
      e.target.closest(".qrs-autoscan-chip")
    ) {
      return;
    }
    if (!canManualSnip()) return;

    e.preventDefault();
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
    updateSelBox(startX, startY, 0, 0);
    selBox.classList.add("qrs-selbox--active");
    overlay.classList.add("qrs-overlay--selecting");
    document.getElementById("qrs-dock")?.classList.add("qrs-dock--hidden");
  }

  function onMouseMove(e) {
    const gh = guideLines.querySelector(".qrs-guide-h");
    const gv = guideLines.querySelector(".qrs-guide-v");
    if (gh) gh.style.top = e.clientY + "px";
    if (gv) gv.style.left = e.clientX + "px";

    if (!isSelecting) return;
    const x = Math.min(e.clientX, startX);
    const y = Math.min(e.clientY, startY);
    const w = Math.abs(e.clientX - startX);
    const h = Math.abs(e.clientY - startY);
    updateSelBox(x, y, w, h);
  }

  function onMouseUp(e) {
    if (!isSelecting) return;
    isSelecting = false;

    const x = Math.min(e.clientX, startX);
    const y = Math.min(e.clientY, startY);
    const w = Math.abs(e.clientX - startX);
    const h = Math.abs(e.clientY - startY);

    if (w < 10 || h < 10) {
      resetSelection();
      return;
    }

    guideLines.style.display = "none";
    overlay.classList.add("qrs-overlay--frozen");
    captureSelection({ x, y, width: w, height: h });
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      if (settingsOpen) {
        closeSettingsPanel();
        return;
      }
      if (historyOpen) {
        closeHistoryPanel();
        return;
      }
      if (modalOpen) {
        const modal = document.getElementById("qrs-modal");
        if (modal) dismissModal(modal, false);
        return;
      }
      closeWindow();
      return;
    }

    if (!modalOpen) return;
    if (e.key === "c" || e.key === "C") {
      if (e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      const copyBtn = document.getElementById("qrs-copy-btn");
      const primaryBtn = document.getElementById("qrs-primary-btn");
      if (copyBtn) copyBtn.click();
      else if (primaryBtn) primaryBtn.click();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const primary = document.getElementById("qrs-primary-btn");
      if (primary) primary.click();
      else document.getElementById("qrs-copy-btn")?.click();
    }
  }

  function updateSelBox(x, y, w, h) {
    selBox.style.left = x + "px";
    selBox.style.top = y + "px";
    selBox.style.width = w + "px";
    selBox.style.height = h + "px";
  }

  function resetSelection() {
    selBox.classList.remove("qrs-selbox--active");
    overlay.classList.remove("qrs-overlay--selecting");
    overlay.classList.remove("qrs-overlay--frozen");
    guideLines.style.display = "block";
    document.getElementById("qrs-dock")?.classList.remove("qrs-dock--hidden");
    document.querySelector(".qrs-scan-wrap")?.remove();
  }

  function scanAgain() {
    dismissReviewPrompt(true);
    const modal = document.getElementById("qrs-modal");
    if (modal) dismissModal(modal, false);
    resetSelection();
    clearAutoscanChips();
    overlay?.classList.remove("qrs-overlay--autoscan");
    modalOpen = false;
    if (autoScanEnabled) void runAutoScan();
  }

  // ─── Image coordinate helpers (object-fit: contain, top-left) ───────────
  function getDisplayedImageRect(img) {
    const elW = img.clientWidth;
    const elH = img.clientHeight;
    const natW = img.naturalWidth || 1;
    const natH = img.naturalHeight || 1;
    const scale = Math.min(elW / natW, elH / natH);
    return {
      x: 0,
      y: 0,
      width: natW * scale,
      height: natH * scale,
      scale,
    };
  }

  function viewportRectToNatural(img, rect) {
    const disp = getDisplayedImageRect(img);
    const scale = disp.scale;
    return {
      x: (rect.x - disp.x) / scale,
      y: (rect.y - disp.y) / scale,
      width: rect.width / scale,
      height: rect.height / scale,
    };
  }

  function naturalBboxToViewport(img, bbox) {
    const disp = getDisplayedImageRect(img);
    const scale = disp.scale;
    return {
      cx: disp.x + (bbox.x + bbox.width / 2) * scale,
      cy: disp.y + (bbox.y + bbox.height / 2) * scale,
      width: bbox.width * scale,
      height: bbox.height * scale,
    };
  }

  function truncatePreview(text, max) {
    const s = String(text || "");
    if (s.length <= max) return s;
    return s.slice(0, max - 1) + "…";
  }

  function setDockHintText(text) {
    const hint = document.getElementById("qrs-dock-hint");
    if (!hint) return;
    hint.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 7V5a2 2 0 012-2h2"/><path d="M17 3h2a2 2 0 012 2v2"/><path d="M21 17v2a2 2 0 01-2 2h-2"/><path d="M7 21H5a2 2 0 01-2-2v-2"/>
      </svg>
      ${escapeHtml(text)}`;
  }

  function clearAutoscanChips() {
    overlay?.querySelectorAll(".qrs-autoscan-chip").forEach((el) => el.remove());
    document.getElementById("qrs-autoscan-fx")?.remove();
    autoscanFoundCodes = false;
    syncOverlaySnipState();
  }

  function ensureAutoscanFx() {
    let fx = document.getElementById("qrs-autoscan-fx");
    if (fx) return fx;

    fx = document.createElement("div");
    fx.id = "qrs-autoscan-fx";
    fx.className = "qrs-autoscan-fx";
    fx.innerHTML = `
      <div class="qrs-autoscan-dim" aria-hidden="true"></div>
      <div class="qrs-autoscan-noise" aria-hidden="true"></div>
      <div class="qrs-autoscan-border" aria-hidden="true"></div>
      <div class="qrs-autoscan-pulse" aria-hidden="true"></div>
    `;
    overlay.insertBefore(fx, overlay.firstChild);
    return fx;
  }

  function startAutoscanFx() {
    const fx = ensureAutoscanFx();
    overlay.insertBefore(fx, overlay.firstChild);
    fx.classList.remove("qrs-autoscan-fx--done");
    fx.classList.add("qrs-autoscan-fx--scanning");
    return fx;
  }

  function finishAutoscanFx() {
    const fx = document.getElementById("qrs-autoscan-fx");
    if (!fx) return;
    fx.classList.remove("qrs-autoscan-fx--scanning");
    fx.classList.add("qrs-autoscan-fx--done");
  }

  function autoscanDockHint(count) {
    if (count === 0) {
      return empty ? "Drop or paste an image" : "No codes found — drag to select";
    }
    const base =
      count === 1 ? "1 code found" : `${count} codes found`;
    if (canManualSnip()) return `${base} · tap or drag to scan`;
    return `${base} · tap a code`;
  }

  function autoscanChipIcon(type) {
    return typeGlyph(type).replace(/width="18" height="18"/g, 'width="14" height="14"');
  }

  async function openAutoscanResult(det) {
    const parsed = parsePayload(det.rawValue, det.format);
    currentResults = [parsed];
    await addHistoryEntry({ format: parsed.format, type: parsed.type, raw: parsed.raw });
    pendingReviewPrompt = await noteSuccessfulScan();
    const showReview = pendingReviewPrompt;
    pendingReviewPrompt = false;
    showResultModal(parsed, { showReview });
  }

  function renderAutoscanChips(detections) {
    overlay?.querySelectorAll(".qrs-autoscan-chip").forEach((el) => el.remove());

    const img = document.getElementById("screenshot-bg");

    detections.forEach((det, index) => {
      const parsed = parsePayload(det.rawValue, det.format);
      const vp = naturalBboxToViewport(img, det.bbox);
      const preview = truncatePreview(parsed.display, 32);

      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "qrs-autoscan-chip";
      chip.style.left = `${vp.cx}px`;
      chip.style.top = `${vp.cy}px`;
      chip.style.animationDelay = `${index * 45}ms`;
      chip.innerHTML = `
        <span class="qrs-autoscan-chip-icon" aria-hidden="true">${autoscanChipIcon(parsed.type)}</span>
        <span class="qrs-autoscan-chip-text">${escapeHtml(preview)}</span>
      `;
      chip.addEventListener("click", (e) => {
        e.stopPropagation();
        void openAutoscanResult(det);
      });
      overlay.appendChild(chip);
    });
  }

  async function runAutoScan() {
    if (autoScanRunning || modalOpen) return;

    const img = document.getElementById("screenshot-bg");
    if (!img?.src || img.style.display === "none" || !img.naturalWidth) return;

    autoScanRunning = true;
    autoscanFoundCodes = false;
    clearAutoscanChips();
    overlay.classList.add("qrs-overlay--autoscan");
    syncOverlaySnipState();
    startAutoscanFx();
    setDockHintText("Detecting…");

    const fxStarted = performance.now();
    const MIN_FX_MS = 450;

    try {
      await initDecoder();
      const detections = await detectCodesWithBounds(img);
      const elapsed = performance.now() - fxStarted;
      if (elapsed < MIN_FX_MS) await sleep(MIN_FX_MS - elapsed);

      finishAutoscanFx();

      if (!detections.length) {
        overlay.classList.remove("qrs-overlay--autoscan");
        document.getElementById("qrs-autoscan-fx")?.remove();
        setDockHintText(autoscanDockHint(0));
        showToast("No codes found — drag to select an area.", "info");
        autoScanRunning = false;
        return;
      }

      autoscanFoundCodes = true;
      syncOverlaySnipState();
      renderAutoscanChips(detections);
      setDockHintText(autoscanDockHint(detections.length));
    } catch (err) {
      console.error("[QRSnip] Auto-scan failed:", err);
      finishAutoscanFx();
      overlay.classList.remove("qrs-overlay--autoscan");
      document.getElementById("qrs-autoscan-fx")?.remove();
      autoscanFoundCodes = false;
      syncOverlaySnipState();
      setDockHintText("Drag around a code to scan");
      showToast("Auto-scan failed — try dragging to select.", "error");
    }

    autoScanRunning = false;
  }

  // ─── Capture & Decode ────────────────────────────────────────────────────
  async function captureSelection(rect) {
    clearAutoscanChips();
    overlay?.classList.remove("qrs-overlay--autoscan");

    const scanEl = buildScanAnimation(rect);
    overlay.appendChild(scanEl);

    const duration = Math.min(900, Math.max(420, Math.max(rect.width, rect.height) * 1.2));
    scanEl.style.setProperty("--qrs-scan-ms", duration + "ms");
    await sleep(duration);

    const img = document.getElementById("screenshot-bg");
    if (!img || !img.src || img.style.display === "none") {
      scanEl.remove();
      showToast("No image to scan — drop or paste one first.", "info");
      resetSelection();
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    const ctx = canvas.getContext("2d");

    const natRect = viewportRectToNatural(img, rect);

    ctx.drawImage(
      img,
      natRect.x,
      natRect.y,
      natRect.width,
      natRect.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    scanEl.classList.add("qrs-scan-wrap--success");
    await sleep(120);
    scanEl.remove();

    await detectFromCanvas(canvas);
  }

  async function detectFromCanvas(canvas) {
    try {
      await initDecoder();
    } catch (_) {
      showToast("Barcode decoder unavailable in this browser.", "error");
      resetSelection();
      return;
    }

    let barcodes = [];
    try {
      barcodes = await detectCodes(canvas);
    } catch (_) {
      showToast("Decode error — try a clearer selection.", "error");
      resetSelection();
      return;
    }

    if (!barcodes.length) {
      showToast("No code found — try a tighter crop or better contrast.", "info");
      resetSelection();
      return;
    }

    const results = barcodes.map((b) =>
      parsePayload(b.rawValue || "", b.format || "unknown")
    );
    currentResults = results;

    // Persist all detections to history
    for (const r of results) {
      await addHistoryEntry({ format: r.format, type: r.type, raw: r.raw });
    }

    pendingReviewPrompt = await noteSuccessfulScan();

    if (results.length === 1) {
      const showReview = pendingReviewPrompt;
      pendingReviewPrompt = false;
      showResultModal(results[0], { showReview });
    } else {
      showMultiResultModal(results);
    }
  }

  async function detectFromImageElement(imgEl) {
    try {
      await initDecoder();
    } catch (_) {
      showToast("Barcode decoder unavailable in this browser.", "error");
      return;
    }

    const scanRect = {
      x: Math.round(window.innerWidth * 0.15),
      y: Math.round(window.innerHeight * 0.15),
      width: Math.round(window.innerWidth * 0.7),
      height: Math.round(window.innerHeight * 0.7),
    };
    const scanEl = buildScanAnimation(scanRect);
    overlay.appendChild(scanEl);
    scanEl.style.setProperty("--qrs-scan-ms", "700ms");
    await sleep(700);

    let barcodes = [];
    try {
      barcodes = await detectCodes(imgEl);
    } catch (_) {
      scanEl.remove();
      showToast("Decode error — try another image.", "error");
      return;
    }

    scanEl.classList.add("qrs-scan-wrap--success");
    await sleep(120);
    scanEl.remove();

    if (!barcodes.length) {
      showToast("No code found in this image.", "info");
      return;
    }

    const results = barcodes.map((b) =>
      parsePayload(b.rawValue || "", b.format || "unknown")
    );
    currentResults = results;
    for (const r of results) {
      await addHistoryEntry({ format: r.format, type: r.type, raw: r.raw });
    }

    pendingReviewPrompt = await noteSuccessfulScan();

    if (results.length === 1) {
      const showReview = pendingReviewPrompt;
      pendingReviewPrompt = false;
      showResultModal(results[0], { showReview });
    } else {
      showMultiResultModal(results);
    }
  }

  // ─── Drop / Paste ────────────────────────────────────────────────────────
  function bindGlobalDropPaste() {
    const prevent = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    ["dragenter", "dragover", "dragleave", "drop"].forEach((ev) => {
      document.addEventListener(ev, prevent);
    });

    document.addEventListener("drop", async (e) => {
      if (modalOpen) return;
      const file = [...(e.dataTransfer?.files || [])].find((f) =>
        f.type.startsWith("image/")
      );
      if (!file) return;
      await loadImageFile(file);
    });

    document.addEventListener("paste", async (e) => {
      if (modalOpen) return;
      const items = [...(e.clipboardData?.items || [])];
      const item = items.find((i) => i.type.startsWith("image/"));
      if (!item) return;
      const file = item.getAsFile();
      if (file) await loadImageFile(file);
    });
  }

  async function loadImageFile(file) {
    const dataUrl = await readFileAsDataURL(file);
    const bgImg = document.getElementById("screenshot-bg");
    bgImg.style.display = "block";
    document.body.classList.remove("qrs-empty");

    await new Promise((resolve) => {
      bgImg.onload = resolve;
      bgImg.onerror = resolve;
      bgImg.src = dataUrl;
    });

    const hint = document.getElementById("qrs-dock-hint");
    if (hint && !autoScanEnabled) {
      hint.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 7V5a2 2 0 012-2h2"/><path d="M17 3h2a2 2 0 012 2v2"/><path d="M21 17v2a2 2 0 01-2 2h-2"/><path d="M7 21H5a2 2 0 01-2-2v-2"/>
        </svg>
        Drag around a code to scan`;
    }

    if (autoScanEnabled) {
      await runAutoScan();
    } else {
      await detectFromImageElement(bgImg);
    }
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ─── Scan Animation ──────────────────────────────────────────────────────
  function buildScanAnimation(rect) {
    const wrap = document.createElement("div");
    wrap.className = "qrs-scan-wrap";
    wrap.style.cssText = `
      left: ${rect.x}px;
      top: ${rect.y}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
    `;

    ["tl", "tr", "bl", "br"].forEach((pos) => {
      const c = document.createElement("div");
      c.className = `qrs-corner qrs-corner--${pos}`;
      wrap.appendChild(c);
    });

    const line = document.createElement("div");
    line.className = "qrs-scanline";
    wrap.appendChild(line);

    const glow = document.createElement("div");
    glow.className = "qrs-scanglow";
    wrap.appendChild(glow);

    return wrap;
  }

  // ─── Result Modal (single) ───────────────────────────────────────────────
  function showResultModal(parsed, { showReview = false } = {}) {
    modalOpen = true;
    document.getElementById("qrs-modal")?.remove();

    const modal = document.createElement("div");
    modal.id = "qrs-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    const primary = parsed.primary;
    const primaryIsCopy = primary && (primary.id === "copy" || primary.id === "copy_password");

    modal.innerHTML = `
      <div class="qrs-modal-inner">
        <div class="qrs-modal-header">
          <span class="qrs-modal-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
          <div class="qrs-modal-titles">
            <span class="qrs-modal-label">Code Detected</span>
            <div class="qrs-chips">
              <span class="qrs-chip qrs-chip--format" style="animation-delay:40ms">${typeChipIcon(parsed.type)}${escapeHtml(parsed.formatLabel)}</span>
              <span class="qrs-chip qrs-chip--type" style="animation-delay:90ms">${escapeHtml(parsed.typeLabel)}</span>
            </div>
          </div>
          <div class="qrs-modal-header-actions">
            <button type="button" class="qrs-modal-tool" id="qrs-modal-history" title="Scan history" aria-label="Scan history">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>
              </svg>
            </button>
            <button class="qrs-modal-close" aria-label="Close" id="qrs-close-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="qrs-modal-body">
          <div class="qrs-result-plate">
            <p class="qrs-result-text">${escapeHtml(parsed.display)}</p>
            <button type="button" class="qrs-result-copy-inline" id="qrs-copy-inline" title="Copy" aria-label="Copy">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="qrs-modal-actions">
          <button class="qrs-btn qrs-btn--ghost" id="qrs-again-btn" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            Scan again
          </button>
          ${
            primaryIsCopy
              ? ""
              : `<button class="qrs-btn qrs-btn--ghost" id="qrs-copy-btn" type="button">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  Copy
                </button>`
          }
          ${
            primary
              ? `<button class="qrs-btn qrs-btn--primary" id="qrs-primary-btn" type="button">
                  ${primaryActionIcon(primary.id)}
                  ${escapeHtml(primary.label)}
                </button>`
              : `<button class="qrs-btn qrs-btn--primary" id="qrs-copy-btn" type="button">Copy</button>`
          }
        </div>
      </div>
    `;

    document.documentElement.appendChild(modal);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => modal.classList.add("qrs-modal--visible"));
    });

    wireResultModal(modal, parsed, primaryIsCopy);
    if (showReview) {
      scheduleReviewPrompt();
    }
  }

  let reviewPromptTimer = null;

  function scheduleReviewPrompt() {
    clearTimeout(reviewPromptTimer);
    reviewPromptTimer = setTimeout(() => {
      reviewPromptTimer = null;
      showReviewPrompt();
    }, 620);
  }

  function showReviewPrompt() {
    dismissReviewPrompt(true);
    markReviewPromptDone();

    const el = document.createElement("div");
    el.id = "qrs-review-prompt";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Feedback");
    el.innerHTML = `
      <div class="qrs-review-card">
        <button type="button" class="qrs-review-dismiss" id="qrs-review-dismiss" aria-label="Dismiss">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div class="qrs-review-icon" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6z"/>
          </svg>
        </div>
        <div class="qrs-review-copy">
          <p class="qrs-review-title">Finding QRSnip useful?</p>
          <p class="qrs-review-sub">Your feedback helps others discover a private, offline scanner.</p>
        </div>
        <div class="qrs-review-actions">
          <button type="button" class="qrs-btn qrs-btn--ghost" id="qrs-review-later">Not now</button>
          <a class="qrs-btn qrs-btn--primary" id="qrs-review-link" href="${REVIEW_URL}" target="_blank" rel="noopener noreferrer">Share feedback</a>
        </div>
      </div>
    `;

    document.documentElement.appendChild(el);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add("qrs-review-prompt--visible"));
    });

    el.querySelector("#qrs-review-dismiss")?.addEventListener("click", () =>
      dismissReviewPrompt()
    );
    el.querySelector("#qrs-review-later")?.addEventListener("click", () =>
      dismissReviewPrompt()
    );
    el.querySelector("#qrs-review-link")?.addEventListener("click", () => {
      setTimeout(() => dismissReviewPrompt(), 120);
    });
  }

  function dismissReviewPrompt(instant) {
    clearTimeout(reviewPromptTimer);
    reviewPromptTimer = null;
    const el = document.getElementById("qrs-review-prompt");
    if (!el) return;
    if (instant) {
      el.remove();
      return;
    }
    el.classList.remove("qrs-review-prompt--visible");
    el.classList.add("qrs-review-prompt--out");
    setTimeout(() => el.remove(), 320);
  }

  function wireResultModal(modal, parsed, primaryIsCopy) {
    document.getElementById("qrs-close-btn")?.addEventListener("click", () =>
      dismissModal(modal, false)
    );
    document.getElementById("qrs-again-btn")?.addEventListener("click", scanAgain);
    document.getElementById("qrs-modal-history")?.addEventListener("click", (e) => {
      e.stopPropagation();
      openHistoryFromModal(modal);
    });

    const doCopy = async (btn) => {
      await navigator.clipboard.writeText(parsed.copyValue);
      if (btn) markCopied(btn);
    };

    const copyBtn = document.getElementById("qrs-copy-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => doCopy(copyBtn));
    }

    document.getElementById("qrs-copy-inline")?.addEventListener("click", async (e) => {
      e.stopPropagation();
      await navigator.clipboard.writeText(parsed.copyValue);
      const inline = e.currentTarget;
      inline.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
      inline.style.color = "var(--qrs-success)";
    });

    const primaryBtn = document.getElementById("qrs-primary-btn");
    if (primaryBtn && parsed.primary) {
      primaryBtn.addEventListener("click", async () => {
        const result = await runPrimaryAction(parsed.primary);
        if (result === "copied") {
          markCopied(primaryBtn);
        } else if (result === "opened") {
          dismissModal(modal, false);
        }
      });
    }

    modal.addEventListener("click", (e) => {
      if (e.target === modal) dismissModal(modal, false);
    });
  }

  function openHistoryFromModal(modal) {
    dismissReviewPrompt(true);
    if (modal) {
      modal.remove();
      modalOpen = false;
    }
    resetSelection();
    openHistoryPanel();
  }

  function markCopied(btn) {
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied`;
    btn.classList.add("qrs-btn--copied");
  }

  function primaryActionIcon(id) {
    if (id === "open" || id === "maps") {
      return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
    }
    if (id === "tel") {
      return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`;
    }
    return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`;
  }

  function formatGlyph(format) {
    const f = (format || "").toLowerCase();
    if (f.includes("qr") || f.includes("aztec") || f.includes("matrix") || f.includes("maxi")) {
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v6M14 20h3"/></svg>`;
    }
    if (f.includes("pdf")) {
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>`;
    }
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5v14M7 5v14M10 5v14M14 5v14M18 5v14M21 5v14"/></svg>`;
  }

  function typeGlyph(type) {
    const t = (type || "").toLowerCase();
    if (t === "url" || t === "link") {
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`;
    }
    if (t === "wifi") {
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><circle cx="12" cy="20" r="1"/></svg>`;
    }
    if (t === "vcard" || t === "contact" || t === "mecard") {
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    }
    if (t === "tel" || t === "sms") {
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`;
    }
    if (t === "email" || t === "mailto") {
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
    }
    if (t === "geo" || t === "maps") {
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
    }
    return formatGlyph("barcode");
  }

  function typeChipIcon(type) {
    const t = (type || "").toLowerCase();
    if (t === "url" || t === "link") {
      return `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`;
    }
    return "";
  }

  // ─── Multi Result Modal ──────────────────────────────────────────────────
  function showMultiResultModal(results) {
    modalOpen = true;
    document.getElementById("qrs-modal")?.remove();

    const modal = document.createElement("div");
    modal.id = "qrs-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    const items = results
      .map(
        (r, i) => `
      <button type="button" class="qrs-result-item" data-index="${i}" style="animation-delay:${40 + i * 50}ms">
        <span class="qrs-result-item-icon" aria-hidden="true">${formatGlyph(r.format)}</span>
        <span class="qrs-result-item-format">${escapeHtml(r.formatLabel)}</span>
        <span class="qrs-result-item-preview">${escapeHtml(r.display.slice(0, 80))}</span>
        <span class="qrs-chip qrs-chip--type">${escapeHtml(r.typeLabel)}</span>
      </button>`
      )
      .join("");

    modal.innerHTML = `
      <div class="qrs-modal-inner qrs-modal-inner--list">
        <div class="qrs-modal-header">
          <span class="qrs-modal-icon qrs-modal-icon--list" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </span>
          <div class="qrs-modal-titles">
            <span class="qrs-modal-label">${results.length} Codes Found</span>
            <span class="qrs-modal-sub">Scanned just now</span>
          </div>
          <div class="qrs-modal-header-actions">
            <button type="button" class="qrs-modal-tool" id="qrs-modal-history" title="Scan history" aria-label="Scan history">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>
              </svg>
            </button>
            <button class="qrs-modal-close" aria-label="Close" id="qrs-close-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="qrs-modal-body qrs-modal-body--list">
          <div class="qrs-result-list">${items}</div>
        </div>
        <div class="qrs-modal-actions qrs-modal-actions--stack">
          <button class="qrs-btn qrs-btn--primary" id="qrs-again-btn" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            Scan again
          </button>
        </div>
      </div>
    `;

    document.documentElement.appendChild(modal);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => modal.classList.add("qrs-modal--visible"));
    });

    document.getElementById("qrs-close-btn")?.addEventListener("click", () =>
      dismissModal(modal, false)
    );
    document.getElementById("qrs-again-btn")?.addEventListener("click", scanAgain);
    document.getElementById("qrs-modal-history")?.addEventListener("click", (e) => {
      e.stopPropagation();
      openHistoryFromModal(modal);
    });

    modal.querySelectorAll(".qrs-result-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.index);
        const showReview = pendingReviewPrompt;
        pendingReviewPrompt = false;
        modal.remove();
        showResultModal(results[idx], { showReview });
      });
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) dismissModal(modal, false);
    });
  }

  function dismissModal(modal, closeWindowAfter) {
    dismissReviewPrompt(true);
    modal.classList.remove("qrs-modal--visible");
    setTimeout(() => {
      modal.remove();
      modalOpen = false;
      if (closeWindowAfter) {
        closeWindow();
      } else {
        resetSelection();
      }
    }, 280);
  }

  // ─── History Panel ───────────────────────────────────────────────────────
  async function openHistoryPanel() {
    if (historyOpen) {
      closeHistoryPanel();
      return;
    }
    closeSettingsPanel();
    historyOpen = true;
    document.getElementById("qrs-history-panel")?.remove();

    const list = await getHistory();
    const panel = document.createElement("div");
    panel.id = "qrs-history-panel";
    panel.innerHTML = `
      <div class="qrs-history-header">
        <span class="qrs-history-title">Scan History</span>
        <div class="qrs-history-actions">
          ${
            list.length
              ? `<button type="button" class="qrs-tool-btn qrs-tool-btn--danger" id="qrs-history-clear">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                  Clear
                </button>`
              : ""
          }
          <button type="button" class="qrs-tool-btn qrs-tool-btn--icon" id="qrs-history-close" aria-label="Close history">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="qrs-history-list">
        ${
          list.length
            ? list
                .map((e) => {
                  const parsed = parsePayload(e.raw, e.format);
                  return `
          <button type="button" class="qrs-history-item" data-id="${escapeHtml(e.id)}">
            <span class="qrs-history-item-icon" aria-hidden="true">${typeGlyph(parsed.type || e.type)}</span>
            <div class="qrs-history-item-main">
              <span class="qrs-history-preview">${escapeHtml(e.preview || e.raw)}</span>
              <div class="qrs-history-item-meta">
                <span class="qrs-chip qrs-chip--format" style="opacity:1;animation:none;height:22px;font-size:10.5px;padding:0 9px">${escapeHtml(formatLabel(e.format))}</span>
                <span class="qrs-history-time">${escapeHtml(formatTime(e.timestamp))}</span>
              </div>
            </div>
            <span class="qrs-history-item-aside">
              <span class="qrs-history-chevron" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </span>
            </span>
          </button>`;
                })
                .join("")
            : `<p class="qrs-history-empty">No scans yet. Snip a code to get started.</p>`
        }
      </div>
    `;

    document.documentElement.appendChild(panel);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => panel.classList.add("qrs-history-panel--visible"));
    });

    document.getElementById("qrs-history-close")?.addEventListener("click", closeHistoryPanel);
    document.getElementById("qrs-history-clear")?.addEventListener("click", async () => {
      await clearHistory();
      closeHistoryPanel();
      showToast("History cleared.", "info");
    });

    const byId = Object.fromEntries(list.map((e) => [e.id, e]));
    panel.querySelectorAll(".qrs-history-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const entry = byId[btn.getAttribute("data-id")];
        if (!entry) return;
        closeHistoryPanel();
        showResultModal(parsePayload(entry.raw, entry.format));
      });
    });
  }

  function closeHistoryPanel() {
    const panel = document.getElementById("qrs-history-panel");
    if (!panel) {
      historyOpen = false;
      return;
    }
    panel.classList.remove("qrs-history-panel--visible");
    setTimeout(() => {
      panel.remove();
      historyOpen = false;
    }, 220);
  }

  async function getShortcutLabel() {
    try {
      const cmds = await chrome.commands.getAll();
      const cmd = cmds.find((c) => c.name === "_execute_action");
      if (cmd?.shortcut) return cmd.shortcut;
      return "Not set";
    } catch (_) {
      return "Alt+Q";
    }
  }

  // ─── Settings Panel ────────────────────────────────────────────────────────
  async function openSettingsPanel() {
    if (settingsOpen) {
      closeSettingsPanel();
      return;
    }
    closeHistoryPanel();
    settingsOpen = true;
    document.getElementById("qrs-settings-panel")?.remove();

    const settings = await getSettings();
    const shortcutLabel = await getShortcutLabel();
    autoScanEnabled = settings.autoScanEnabled;
    manualSnipEnabled = settings.manualSnipEnabled;

    const panel = document.createElement("div");
    panel.id = "qrs-settings-panel";
    panel.innerHTML = `
      <div class="qrs-settings-header">
        <span class="qrs-settings-title">Settings</span>
        <button type="button" class="qrs-tool-btn qrs-tool-btn--icon" id="qrs-settings-close" aria-label="Close settings">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <label class="qrs-settings-row" for="qrs-setting-autoscan">
        <input type="checkbox" id="qrs-setting-autoscan" class="qrs-settings-checkbox" ${
          settings.autoScanEnabled ? "checked" : ""
        } />
        <span class="qrs-settings-label">
          <span class="qrs-settings-label-title">Auto-scan screen</span>
          <span class="qrs-settings-label-hint">Automatically find all codes on the screen when you open the scanner</span>
        </span>
      </label>
      <label class="qrs-settings-row" for="qrs-setting-manual-snip">
        <input type="checkbox" id="qrs-setting-manual-snip" class="qrs-settings-checkbox" ${
          settings.manualSnipEnabled ? "checked" : ""
        } />
        <span class="qrs-settings-label">
          <span class="qrs-settings-label-title">Allow manual crop after auto-scan</span>
          <span class="qrs-settings-label-hint">Drag to select a code after auto-scan finds results on screen</span>
        </span>
      </label>
      <div class="qrs-settings-shortcut">
        <div class="qrs-settings-shortcut-row">
          <span class="qrs-settings-label-title">Keyboard shortcut</span>
          <kbd class="qrs-kbd">${escapeHtml(shortcutLabel)}</kbd>
        </div>
        <p class="qrs-settings-label-hint">If the shortcut does not work, set it once at chrome://extensions/shortcuts</p>
        <button type="button" class="qrs-btn qrs-btn--ghost qrs-settings-shortcut-btn" id="qrs-open-shortcuts">Set shortcut</button>
      </div>
    `;

    document.documentElement.appendChild(panel);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => panel.classList.add("qrs-settings-panel--visible"));
    });

    document.getElementById("qrs-settings-close")?.addEventListener("click", closeSettingsPanel);
    document.getElementById("qrs-setting-autoscan")?.addEventListener("change", async (e) => {
      const next = await setAutoScanEnabled(e.target.checked);
      autoScanEnabled = next.autoScanEnabled;
      if (autoScanEnabled) {
        void runAutoScan();
      } else {
        clearAutoscanChips();
        overlay?.classList.remove("qrs-overlay--autoscan");
        syncOverlaySnipState();
        setDockHintText("Drag around a code to scan");
      }
    });
    document.getElementById("qrs-setting-manual-snip")?.addEventListener("change", async (e) => {
      const next = await setManualSnipEnabled(e.target.checked);
      manualSnipEnabled = next.manualSnipEnabled;
      syncOverlaySnipState();
      if (autoscanFoundCodes) {
        const count = overlay?.querySelectorAll(".qrs-autoscan-chip").length || 0;
        setDockHintText(autoscanDockHint(count));
      }
    });
    document.getElementById("qrs-open-shortcuts")?.addEventListener("click", () => {
      chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
    });
  }

  function closeSettingsPanel() {
    const panel = document.getElementById("qrs-settings-panel");
    if (!panel) {
      settingsOpen = false;
      return;
    }
    panel.classList.remove("qrs-settings-panel--visible");
    setTimeout(() => {
      panel.remove();
      settingsOpen = false;
    }, 220);
  }

  function formatTime(ts) {
    try {
      return new Date(ts).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (_) {
      return "";
    }
  }

  // ─── Toast ───────────────────────────────────────────────────────────────
  function showToast(message, type = "info") {
    document.getElementById("qrs-toast")?.remove();

    const toast = document.createElement("div");
    toast.id = "qrs-toast";
    toast.className = `qrs-toast qrs-toast--${type}`;

    const icon =
      type === "error"
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

    toast.innerHTML = `${icon}<span>${escapeHtml(message)}</span>`;
    document.documentElement.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add("qrs-toast--visible"));
    });

    setTimeout(() => {
      toast.classList.remove("qrs-toast--visible");
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
