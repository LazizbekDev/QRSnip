# QRSnip v2.3 — Chrome Web Store Listing

Copy these fields into the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

---

## Name (max 75)
```
QRSnip: QR Code & Barcode Scanner
```

## Short description (max 132)
```
Screen QR scanner — draw around any code and decode it instantly. Works offline, reads barcodes from images and PDFs too.
```
Length: 121 characters.

## Detailed description
```
Need to scan a QR code without reaching for your phone?

Draw around any QR code on your screen and decode it instantly — no phone camera, no uploads, no accounts. QRSnip is a screen QR scanner that works like a snipping tool: select an area, get the result.

It also reads barcodes from images and PDFs. Drop or paste a file, or right-click any image on a page. Everything runs offline in your browser. Nothing ever leaves your device.

What makes QRSnip different?
• Works as a QR snipping tool — draw a selection on any webpage, just like a screenshot tool
• Scan QR codes from images you drop or paste, including codes inside PDFs opened in Chrome
• Offline QR reader — no server, no cloud, no tracking. Decoding happens 100% locally
• Smart actions — links open automatically, Wi-Fi passwords are ready to copy, contacts and locations just work
• Reads 30+ barcode formats: QR, Micro QR, rMQR, Data Matrix, Aztec, MaxiCode, PDF417, EAN/UPC, Code 128/39/93, GS1 DataBar, Telepen, Code 32, PZN, and more
• Detects multiple codes in a single selection
• Local scan history you can revisit or clear anytime
• Keyboard shortcut: Alt+Q (⌥Q on Mac) — scan without leaving the tab
• Minimal permissions — the extension only accesses the page when you activate it

How to use
1. Click the QRSnip icon or press Alt+Q (⌥Q on Mac)
2. Drag a selection around the code on your screen
3. Copy, open the link, or use the smart action — or tap Scan again

Privacy
Screenshots and decoded data never leave your device. Scan history stays in local storage only. Decoding uses local browser APIs and a bundled open-source WebAssembly engine — nothing is sent to a server. We collect nothing.
```

**Do not** add a "keywords people search" list or comma-separated SEO keyword dumps — Chrome rejects this as Keyword Spam (Yellow Argon).

## Category
```
Productivity
```
(Alternative: Tools)

## Language
```
English
```

## Store listing assets checklist
- [x] Screenshots (1280×800) in `store-assets/screenshots/`
  1. `01-snip-selection.png` — snip around a QR code
  2. `02-result-open-link.png` — result modal + Open Link
  3. `03-multiformat-codes.png` — multi-format / multiple codes
  4. `04-history-panel.png` — history panel
- [x] Smaller copies (640×400) in `store-assets/screenshots/640x400/`
- [x] Store icon: 128×128 PNG (`icons/icon128.png` / `store-assets/store-icon-128.png` from `store-icon-128-brand.png`)
- [x] Small promo tile 440×280: `store-assets/promo/small-promo-440x280.png` (also `.jpg`; brand-only alt: `small-promo-440x280-brand.png`)
- [x] Marquee promo tile 1400×560: `store-assets/promo/marquee-promo-1400x560.png` (also `.jpg`)
- [ ] Privacy policy URL: host `index.html` publicly and paste that URL in the dashboard

All promo tiles are **24-bit RGB (no alpha)** — Store-compliant.

Upload order in the Dashboard: 01 → 02 → 03 → 04.

## Permission justification (Dashboard → Privacy)
| Permission | Justification |
|---|---|
| activeTab | Capture the current tab screenshot only when the user clicks the action, shortcut, or context menu, so codes on screen (including web PDFs) can be scanned locally. |
| storage | Temporarily store the screenshot during the scan flow; optionally keep a local scan history on-device. |
| contextMenus | Provide "Scan with QRSnip" when right-clicking an image. |
| file:///* | Scan QR/barcodes in local PDF files and images opened via the file:// protocol. Users must also enable "Allow access to file URLs". |

**Not requested:** `<all_urls>` — http(s) pages are covered by activeTab on user gesture.
**Single purpose:** Scan QR codes and barcodes from the screen or images.
**Remote code:** None
**Data collection:** None (local-only processing)

## Shortcut note for users
If Alt+Q / ⌥Q does not fire after update, set it at `chrome://extensions/shortcuts`.
