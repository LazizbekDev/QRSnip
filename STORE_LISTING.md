# QRSnip v2.1 — Chrome Web Store Listing

Copy these fields into the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

---

## Name (max 75)
```
QRSnip: QR Code & Barcode Scanner
```

## Short description (max 132) — SEO
```
Free offline QR code & barcode scanner. Snip any screen area, scan images, smart actions & local history. No data collection.
```
Length: 125 characters.

## Detailed description
```
QRSnip is a fast, private QR code and barcode scanner for Chrome. Snip any area of the page — or drop/paste an image — and decode instantly. Everything runs locally in your browser. No uploads. No tracking. 100% offline.

★ Why QRSnip?
• Screen snip scanner — draw around any code on a webpage
• Multi-format: QR, EAN-13, EAN-8, UPC, Code 128/39/93, Codabar, ITF, Data Matrix, PDF417, Aztec
• Smart actions: open links, copy Wi-Fi passwords, call/SMS/email, open maps, copy contacts
• Multiple codes in one selection
• Local scan history (clear anytime)
• Keyboard shortcut: Alt+Q (⌥Q on Mac)
• Right-click any image → “Scan with QRSnip”
• Drop or paste images to scan
• Minimal permissions — activeTab only when you scan
• No ads, no accounts, no cloud

★ Perfect for
Developers • QA testers • Marketers • Support teams • Anyone who needs a private QR/barcode reader without leaving the tab

★ How to use
1. Click the QRSnip icon or press Alt+Q (⌥Q on Mac)
2. Drag a selection around the QR code or barcode
3. Copy, open, or use the smart action — or tap Scan again

★ Privacy first
Screenshots and decoded data never leave your device. Scan history stays in local storage only. We collect nothing.

Keywords people search: QR code scanner, barcode reader, QR scanner Chrome, offline QR scanner, screen QR scanner, scan QR from webpage, EAN barcode scanner, privacy QR reader
```

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
- [ ] Store icon: 128×128 PNG (use `icons/icon128.png`)
- [ ] Small promo tile: 440×280 (optional but recommended)
- [ ] Screenshots: at least 1, ideally 3–5 (1280×800 or 640×400)
  1. Snip selection around a QR code
  2. Result modal with smart action (Open Link)
  3. Multi-format / barcode example
  4. History panel
- [ ] Privacy policy URL: host `index.html` publicly (GitHub Pages / your site) and paste that URL in the dashboard

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
