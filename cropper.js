// ─── QRSnip · Cropper Interface ─────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Load screenshot from storage
  const data = await chrome.storage.local.get("capturedImage");
  if (!data.capturedImage) {
    alert("Failed to load screenshot data.");
    window.close();
    return;
  }

  const bgImg = document.getElementById("screenshot-bg");
  bgImg.onload = () => {
    // 2. Initialize snipping tool once image is loaded
    initSnip();
  };
  bgImg.src = data.capturedImage;
});

function initSnip() {
  // ─── State ───────────────────────────────────────────────────────────────
  let overlay = null;
  let isSelecting = false;
  let startX = 0, startY = 0;
  let selBox = null;
  let guideLines = null;

  buildOverlay();

  // ─── Build full-screen overlay ───────────────────────────────────────────
  function buildOverlay() {
    overlay = document.createElement("div");
    overlay.id = "qrs-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "QRSnip — draw a selection");

    // Crosshair guide lines (follow cursor)
    guideLines = document.createElement("div");
    guideLines.id = "qrs-guides";
    guideLines.innerHTML = `<div class="qrs-guide-h"></div><div class="qrs-guide-v"></div>`;
    overlay.appendChild(guideLines);

    // Top instruction badge
    const badge = document.createElement("div");
    badge.id = "qrs-badge";
    badge.innerHTML = 'Draw a selection around the QR code &nbsp;·&nbsp; Esc to cancel &nbsp;&nbsp;<span style="opacity:0.9;color:#4ade80;font-weight:600;">🔒 No Data Collection. 100% Offline.</span>';
    overlay.appendChild(badge);

    // Selection box (drawn by mouse)
    selBox = document.createElement("div");
    selBox.id = "qrs-selbox";
    overlay.appendChild(selBox);

    document.documentElement.appendChild(overlay);

    // Bind events
    overlay.addEventListener("mousedown", onMouseDown);
    overlay.addEventListener("mousemove", onMouseMove);
    overlay.addEventListener("mouseup", onMouseUp);
    document.addEventListener("keydown", onKeyDown);
  }

  // ─── Destroy overlay / Close Tab ─────────────────────────────────────────
  function closeTab() {
    window.close();
  }

  // ─── Mouse Events ─────────────────────────────────────────────────────────
  function onMouseDown(e) {
    // If we're already showing a modal, don't allow new selection
    if (document.getElementById("qrs-modal")) return;

    e.preventDefault();
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
    updateSelBox(startX, startY, 0, 0);
    selBox.classList.add("qrs-selbox--active");
    overlay.classList.add("qrs-overlay--selecting");
  }

  function onMouseMove(e) {
    // Update crosshair guides
    const gh = guideLines.querySelector(".qrs-guide-h");
    const gv = guideLines.querySelector(".qrs-guide-v");
    gh.style.top = e.clientY + "px";
    gv.style.left = e.clientX + "px";

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
      // Too small — ignore and reset
      resetSelection();
      return;
    }

    // Freeze the selection box visually, hide guides
    guideLines.style.display = "none";
    overlay.classList.add("qrs-overlay--frozen");

    captureSelection({ x, y, width: w, height: h });
  }

  function onKeyDown(e) {
    if (e.key === "Escape") closeTab();
  }

  function updateSelBox(x, y, w, h) {
    selBox.style.left   = x + "px";
    selBox.style.top    = y + "px";
    selBox.style.width  = w + "px";
    selBox.style.height = h + "px";
  }

  function resetSelection() {
    selBox.classList.remove("qrs-selbox--active");
    overlay.classList.remove("qrs-overlay--selecting");
    overlay.classList.remove("qrs-overlay--frozen");
    guideLines.style.display = "block";
  }

  // ─── Capture & Decode ────────────────────────────────────────────────────
  async function captureSelection(rect) {
    // Add scan animation on top of the frozen selection
    const scanEl = buildScanAnimation(rect);
    overlay.appendChild(scanEl);

    // Wait for the scan animation to feel premium (minimum 900ms)
    await sleep(900);

    const img = document.getElementById("screenshot-bg");
    const dpr = window.devicePixelRatio || 1;
    
    const canvas = document.createElement("canvas");
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    
    ctx.drawImage(
      img, 
      rect.x * dpr, rect.y * dpr, rect.width * dpr, rect.height * dpr, 
      0, 0, canvas.width, canvas.height
    );

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    scanEl.remove();

    let result = null;
    try {
      result = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
    } catch (_) {
      showToast("Decode error — try a clearer selection.", "error");
      resetSelection();
      return;
    }

    if (!result) {
      showToast("No QR code detected in selection.", "info");
      resetSelection();
      return;
    }

    showResultModal(result.data, rect);
  }

  // ─── Laser Scan Animation ─────────────────────────────────────────────────
  function buildScanAnimation(rect) {
    const wrap = document.createElement("div");
    wrap.className = "qrs-scan-wrap";
    wrap.style.cssText = `
      left: ${rect.x}px;
      top: ${rect.y}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
    `;

    // Corner accents
    ["tl","tr","bl","br"].forEach(pos => {
      const c = document.createElement("div");
      c.className = `qrs-corner qrs-corner--${pos}`;
      wrap.appendChild(c);
    });

    // Scan line
    const line = document.createElement("div");
    line.className = "qrs-scanline";
    wrap.appendChild(line);

    // Scan glow reflection
    const glow = document.createElement("div");
    glow.className = "qrs-scanglow";
    wrap.appendChild(glow);

    return wrap;
  }

  // ─── Result Modal ─────────────────────────────────────────────────────────
  function showResultModal(text, rect) {
    const isUrl = /^https?:\/\//i.test(text) || /^www\./i.test(text);
    
    const modal = document.createElement("div");
    modal.id = "qrs-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    modal.innerHTML = `
      <div class="qrs-modal-inner">
        <div class="qrs-modal-header">
          <span class="qrs-modal-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
              <line x1="14" y1="14" x2="14" y2="14.01"/><line x1="17" y1="14" x2="17" y2="14.01"/>
              <line x1="20" y1="14" x2="20" y2="14.01"/><line x1="14" y1="17" x2="14" y2="17.01"/>
              <line x1="17" y1="17" x2="20" y2="20"/>
            </svg>
          </span>
          <span class="qrs-modal-label">QR Code Detected</span>
          <button class="qrs-modal-close" aria-label="Close" id="qrs-close-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="qrs-modal-body">
          <div class="qrs-result-plate">
            <p class="qrs-result-text" id="qrs-result-text">${escapeHtml(text)}</p>
          </div>
        </div>

        <div class="qrs-modal-actions">
          <button class="qrs-btn qrs-btn--ghost" id="qrs-copy-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square">
              <rect x="9" y="9" width="13" height="13" rx="0"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            Copy
          </button>
          ${isUrl ? `
          <button class="qrs-btn qrs-btn--primary" id="qrs-open-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Open Link
          </button>` : ""}
        </div>
      </div>
    `;

    document.documentElement.appendChild(modal);

    // Entrance animation class after paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => modal.classList.add("qrs-modal--visible"));
    });

    // Events
    document.getElementById("qrs-close-btn").addEventListener("click", () => closeModalAndTab(modal));

    document.getElementById("qrs-copy-btn").addEventListener("click", async () => {
      await navigator.clipboard.writeText(text);
      const btn = document.getElementById("qrs-copy-btn");
      btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><polyline points="20 6 9 17 4 12"/></svg> Copied`;
      btn.classList.add("qrs-btn--copied");
      // Close tab after short delay
      setTimeout(() => closeModalAndTab(modal), 1400);
    });

    if (isUrl) {
      document.getElementById("qrs-open-btn")?.addEventListener("click", () => {
        window.open(text.startsWith("http") ? text : "https://" + text, "_blank", "noopener");
        closeModalAndTab(modal);
      });
    }

    // Close on backdrop click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModalAndTab(modal);
    });
  }

  function closeModalAndTab(modal) {
    modal.classList.remove("qrs-modal--visible");
    setTimeout(() => {
      modal.remove();
      closeTab();
    }, 280);
  }

  // ─── Toast Notification ───────────────────────────────────────────────────
  function showToast(message, type = "info") {
    document.getElementById("qrs-toast")?.remove();

    const toast = document.createElement("div");
    toast.id = "qrs-toast";
    toast.className = `qrs-toast qrs-toast--${type}`;

    const icon = type === "error"
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
    }, 3000);
  }

  // ─── Utilities ────────────────────────────────────────────────────────────
  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
