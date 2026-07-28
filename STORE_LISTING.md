# QRSnip v2.1 — Chrome Web Store Listing

Copy these fields into the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

---

## Name (max 75)
```
QRSnip: QR Code & Barcode Scanner
```

## Short description (max 132)
```
Snip any screen area to scan QR codes and barcodes. Smart actions, local history, and 100% offline — no data collection.
```
Length: 118 characters.

## Detailed description
```
QRSnip is a private QR code and barcode scanner for Chrome. Draw a selection around any code on the page — or drop or paste an image — and decode it instantly. Everything runs locally in your browser. No uploads. No tracking. 100% offline.

Why QRSnip?
• Screen snip — draw around a code on any webpage
• Multi-format support: QR, EAN-13, EAN-8, UPC, Code 128/39/93, Codabar, ITF, Data Matrix, PDF417, Aztec
• Smart actions: open links, copy Wi-Fi passwords, call/SMS/email, open maps, copy contacts
• Detect multiple codes in one selection
• Local scan history (clear anytime)
• Keyboard shortcut: Alt+Q (⌥Q on Mac)
• Right-click an image → “Scan with QRSnip”
• Drop or paste images to scan
• Minimal permissions — access only when you scan
• No ads, no accounts, no cloud

How to use
1. Click the QRSnip icon or press Alt+Q (⌥Q on Mac)
2. Drag a selection around the QR code or barcode
3. Copy, open, or use the smart action — or tap Scan again

Privacy
Screenshots and decoded data never leave your device. Scan history stays in local storage only. We collect nothing.
```

**Do not** add a “keywords people search” list or comma-separated SEO keyword dumps — Chrome rejects this as Keyword Spam (Yellow Argon).

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
- [x] Store icon: 128×128 PNG (`icons/icon128.png` / `store-assets/store-icon-128.png`)
- [ ] Small promo tile: 440×280 (optional)
- [ ] Privacy policy URL: host `index.html` publicly and paste that URL in the dashboard

Upload order in the Dashboard: 01 → 02 → 03 → 04.

## Permission justification (Dashboard → Privacy)
| Permission | Justification |
|---|---|
| activeTab | Capture the current tab screenshot only when the user clicks the action, shortcut, or context menu, so codes on screen (including web PDFs) can be scanned locally. |
| storage | Temporarily store the screenshot during the scan flow; optionally keep a local scan history on-device. |
| contextMenus | Provide “Scan with QRSnip” when right-clicking an image. |
| file:///* | Scan QR/barcodes in local PDF files and images opened via the file:// protocol. Users must also enable “Allow access to file URLs”. |

**Not requested:** `<all_urls>` — http(s) pages are covered by activeTab on user gesture.
**Single purpose:** Scan QR codes and barcodes from the screen or images.
**Remote code:** None
**Data collection:** None (local-only processing)

## Shortcut note for users
If Alt+Q / ⌥Q does not fire after update, set it at `chrome://extensions/shortcuts`.
