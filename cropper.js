// ─── QRSnip · Cropper Interface ─────────────────────────────────────────────

const DETECT_FORMATS = [
  "qr_code",
  "aztec",
  "data_matrix",
  "pdf417",
  "ean_13",
  "ean_8",
  "upc_a",
  "upc_e",
  "code_128",
  "code_39",
  "code_93",
  "codabar",
  "itf",
];

document.addEventListener("DOMContentLoaded", async () => {
  const data = await chrome.storage.local.get(["capturedImage", "scanSource"]);
  const bgImg = document.getElementById("screenshot-bg");

  if (!data.capturedImage) {
    // Empty state — allow drop/paste without a prior capture
    bgImg.style.display = "none";
    document.body.classList.add("qrs-empty");
    initSnip({ empty: true });
    return;
  }

  bgImg.onload = () => initSnip({ empty: false });
  bgImg.onerror = () => {
    showBootstrapToast("Failed to load screenshot.");
    initSnip({ empty: true });
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
  let detector = null;
  let modalOpen = false;
  let historyOpen = false;
  let currentResults = [];
  let keyHandler = null;

  buildOverlay();
  bindGlobalDropPaste();
  initDetector();

  async function initDetector() {
    try {
      if (typeof BarcodeDetector === "undefined") {
        showToast("BarcodeDetector unavailable in this browser.", "error");
        return;
      }
      let formats = DETECT_FORMATS;
      if (typeof BarcodeDetector.getSupportedFormats === "function") {
        const supported = await BarcodeDetector.getSupportedFormats();
        formats = DETECT_FORMATS.filter((f) => supported.includes(f));
      }
      detector = new BarcodeDetector({ formats: formats.length ? formats : undefined });
    } catch (_) {
      detector = null;
      showToast("BarcodeDetector unavailable in this browser.", "error");
    }
  }

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

    // Bottom dock — keeps chrome out of the snip area (macOS-screenshot style)
    const dock = document.createElement("div");
    dock.id = "qrs-dock";
    dock.innerHTML = `
      <span class="qrs-dock-hint" id="qrs-dock-hint">${
        empty
          ? "Drop or paste an image"
          : "Drag around a code to scan"
      }</span>
      <span class="qrs-dock-sep" aria-hidden="true"></span>
      <kbd class="qrs-kbd">Esc</kbd>
      <span class="qrs-dock-muted">cancel</span>
      <span class="qrs-dock-spacer"></span>
      <button type="button" class="qrs-tool-btn" id="qrs-history-btn" title="Scan history">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square">
          <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>
        </svg>
        History
      </button>
      <button type="button" class="qrs-tool-btn qrs-tool-btn--icon" id="qrs-close-tool" title="Close" aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square">
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
    document.getElementById("qrs-close-tool").addEventListener("click", (e) => {
      e.stopPropagation();
      closeWindow();
    });
  }

  function closeWindow() {
    window.close();
  }

  // ─── Mouse ───────────────────────────────────────────────────────────────
  function onMouseDown(e) {
    if (modalOpen || historyOpen) return;
    if (e.target.closest("#qrs-dock") || e.target.closest("#qrs-history-panel")) return;

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
    const modal = document.getElementById("qrs-modal");
    if (modal) dismissModal(modal, false);
    resetSelection();
    modalOpen = false;
  }

  // ─── Capture & Decode ────────────────────────────────────────────────────
  async function captureSelection(rect) {
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

    // Map viewport coords to natural image pixels (object-fit: contain, top-left)
    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;

    ctx.drawImage(
      img,
      rect.x * scaleX,
      rect.y * scaleY,
      rect.width * scaleX,
      rect.height * scaleY,
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
    if (!detector) {
      showToast("BarcodeDetector unavailable in this browser.", "error");
      resetSelection();
      return;
    }

    let barcodes = [];
    try {
      barcodes = await detector.detect(canvas);
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

    if (results.length === 1) {
      showResultModal(results[0]);
    } else {
      showMultiResultModal(results);
    }
  }

  async function detectFromImageElement(imgEl) {
    if (!detector) {
      showToast("BarcodeDetector unavailable in this browser.", "error");
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
      barcodes = await detector.detect(imgEl);
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

    if (results.length === 1) showResultModal(results[0]);
    else showMultiResultModal(results);
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
    if (hint) hint.textContent = "Drag around a code to scan";

    // Auto-detect full image first; user can still snip
    await detectFromImageElement(bgImg);
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
  function showResultModal(parsed) {
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
              <line x1="14" y1="14" x2="14" y2="14.01"/><line x1="17" y1="14" x2="17" y2="14.01"/>
              <line x1="20" y1="14" x2="20" y2="14.01"/><line x1="14" y1="17" x2="14" y2="17.01"/>
              <line x1="17" y1="17" x2="20" y2="20"/>
            </svg>
          </span>
          <div class="qrs-modal-titles">
            <span class="qrs-modal-label">Code Detected</span>
            <div class="qrs-chips">
              <span class="qrs-chip qrs-chip--format" style="animation-delay:40ms">${escapeHtml(parsed.formatLabel)}</span>
              <span class="qrs-chip qrs-chip--type" style="animation-delay:90ms">${escapeHtml(parsed.typeLabel)}</span>
            </div>
          </div>
          <button class="qrs-modal-close" aria-label="Close" id="qrs-close-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="qrs-modal-body">
          <div class="qrs-result-plate">
            <p class="qrs-result-text">${escapeHtml(parsed.display)}</p>
          </div>
        </div>

        <div class="qrs-modal-actions">
          <button class="qrs-btn qrs-btn--ghost" id="qrs-again-btn" type="button">Scan again</button>
          ${
            primaryIsCopy
              ? ""
              : `<button class="qrs-btn qrs-btn--ghost" id="qrs-copy-btn" type="button">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square">
                    <rect x="9" y="9" width="13" height="13"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
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
  }

  function wireResultModal(modal, parsed, primaryIsCopy) {
    document.getElementById("qrs-close-btn")?.addEventListener("click", () =>
      dismissModal(modal, true)
    );
    document.getElementById("qrs-again-btn")?.addEventListener("click", scanAgain);

    const copyBtn = document.getElementById("qrs-copy-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        await navigator.clipboard.writeText(parsed.copyValue);
        markCopied(copyBtn);
        setTimeout(() => dismissModal(modal, true), 900);
      });
    }

    const primaryBtn = document.getElementById("qrs-primary-btn");
    if (primaryBtn && parsed.primary) {
      primaryBtn.addEventListener("click", async () => {
        const result = await runPrimaryAction(parsed.primary);
        if (result === "copied") {
          markCopied(primaryBtn);
          setTimeout(() => dismissModal(modal, true), 900);
        } else if (result === "opened") {
          dismissModal(modal, true);
        }
      });
    }

    // If primary is copy and no separate copy btn, primary handles it
    if (primaryIsCopy && primaryBtn) {
      // already wired above via runPrimaryAction
    }

    modal.addEventListener("click", (e) => {
      if (e.target === modal) dismissModal(modal, true);
    });
  }

  function markCopied(btn) {
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><polyline points="20 6 9 17 4 12"/></svg> Copied`;
    btn.classList.add("qrs-btn--copied");
  }

  function primaryActionIcon(id) {
    if (id === "open" || id === "maps") {
      return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
    }
    if (id === "tel") {
      return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`;
    }
    return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><rect x="9" y="9" width="13" height="13"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`;
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
        <span class="qrs-chip qrs-chip--format">${escapeHtml(r.formatLabel)}</span>
        <span class="qrs-chip qrs-chip--type">${escapeHtml(r.typeLabel)}</span>
        <span class="qrs-result-item-preview">${escapeHtml(r.display.slice(0, 80))}</span>
      </button>`
      )
      .join("");

    modal.innerHTML = `
      <div class="qrs-modal-inner qrs-modal-inner--list">
        <div class="qrs-modal-header">
          <span class="qrs-modal-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </span>
          <div class="qrs-modal-titles">
            <span class="qrs-modal-label">${results.length} Codes Found</span>
          </div>
          <button class="qrs-modal-close" aria-label="Close" id="qrs-close-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="qrs-modal-body qrs-modal-body--list">
          <div class="qrs-result-list">${items}</div>
        </div>
        <div class="qrs-modal-actions">
          <button class="qrs-btn qrs-btn--ghost" id="qrs-again-btn" type="button">Scan again</button>
        </div>
      </div>
    `;

    document.documentElement.appendChild(modal);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => modal.classList.add("qrs-modal--visible"));
    });

    document.getElementById("qrs-close-btn")?.addEventListener("click", () =>
      dismissModal(modal, true)
    );
    document.getElementById("qrs-again-btn")?.addEventListener("click", scanAgain);

    modal.querySelectorAll(".qrs-result-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.index);
        modal.remove();
        showResultModal(results[idx]);
      });
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) dismissModal(modal, true);
    });
  }

  function dismissModal(modal, closeWindowAfter) {
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
    historyOpen = true;
    document.getElementById("qrs-history-panel")?.remove();

    const list = await getHistory();
    const panel = document.createElement("div");
    panel.id = "qrs-history-panel";
    panel.innerHTML = `
      <div class="qrs-history-header">
        <span class="qrs-history-title">Scan History</span>
        <div class="qrs-history-actions">
          ${list.length ? `<button type="button" class="qrs-tool-btn" id="qrs-history-clear">Clear</button>` : ""}
          <button type="button" class="qrs-tool-btn" id="qrs-history-close" aria-label="Close history">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="qrs-history-list">
        ${
          list.length
            ? list
                .map(
                  (e) => `
          <button type="button" class="qrs-history-item" data-id="${escapeHtml(e.id)}">
            <div class="qrs-history-item-meta">
              <span class="qrs-chip qrs-chip--format">${escapeHtml(formatLabel(e.format))}</span>
              <span class="qrs-history-time">${escapeHtml(formatTime(e.timestamp))}</span>
            </div>
            <span class="qrs-history-preview">${escapeHtml(e.preview || e.raw)}</span>
          </button>`
                )
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
