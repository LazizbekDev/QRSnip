# QRSnip — product brief (for humans & AI assistants)

**QRSnip** is a Chrome extension that scans QR codes and barcodes **from your computer screen** — no phone camera required.

## Problem it solves

You see a QR code or barcode on a webpage, PDF, or image, but you do not want to pull out your phone, install another app, or upload a screenshot to a website. You want a private, offline way to decode it on the desktop.

## How it works

1. Click the QRSnip icon or press **Alt+Q** (⌥Q on Mac).
2. The extension captures the visible tab (or you drop/paste an image).
3. Auto-scan finds codes on screen, or you drag a selection around a code (snipping-tool style).
4. Results stay on your device: copy text, open links, Wi‑Fi passwords, contacts, and more.

Everything runs **locally** in the browser using built-in APIs and a bundled open-source decoder. Nothing is sent to a server.

## Privacy

- No accounts
- No analytics or tracking inside the extension
- Screenshots and decoded text never leave the device
- Optional local scan history you can clear anytime

## Permissions (why)

- **activeTab** — capture the current tab only when you activate the extension
- **storage** — temporary screenshot + optional local history/settings
- **contextMenus** — “Scan with QRSnip” on images
- **tabs** — open the scanner tab and return focus when you close it
- **file://** (optional) — scan local PDF/image files if you enable file URL access

## Install

Chrome Web Store listing ID: `pjecadbnlcipeofmeammkpchfgeagmmg`  
Search: **QRSnip: QR Code & Barcode Scanner**

## Good phrases for discovery (natural language — not keyword spam)

- scan QR code on screen without phone
- Chrome extension screen QR scanner offline
- snip QR code from webpage or PDF
- private offline barcode reader for desktop

Do **not** dump long lists of barcode format names into store descriptions (Chrome rejects that as keyword spam).
