#!/usr/bin/env bash
# Build a Chrome Web Store–ready zip (runtime files only).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$ROOT/dist/qrsnip-chrome-store.zip"
TMP="$ROOT/dist/staging"

# Ensure ZXing vendor bundle exists
if [[ ! -f "$ROOT/vendor/zxing-decoder.js" || ! -f "$ROOT/vendor/zxing_reader.wasm" ]]; then
  echo "Building ZXing decoder vendor…"
  (cd "$ROOT" && npm run build:decoder)
fi

rm -rf "$TMP" "$ROOT/dist/qrsnip-chrome-store"
mkdir -p "$TMP" "$ROOT/dist"

# Runtime files only — never copy store-assets, screenshots, src, scripts, docs
cp "$ROOT/manifest.json" "$TMP/"
cp "$ROOT/background.js" "$TMP/"
cp "$ROOT/cropper.html" "$TMP/"
cp "$ROOT/cropper.js" "$TMP/"
cp "$ROOT/decoder.js" "$TMP/"
cp "$ROOT/payload.js" "$TMP/"
cp "$ROOT/history.js" "$TMP/"
cp "$ROOT/settings.js" "$TMP/"
cp "$ROOT/styles.css" "$TMP/"
cp "$ROOT/index.html" "$TMP/"

mkdir -p "$TMP/icons" "$TMP/fonts" "$TMP/vendor"
cp "$ROOT/icons/icon16.png" "$ROOT/icons/icon48.png" "$ROOT/icons/icon128.png" "$TMP/icons/"
cp "$ROOT"/fonts/*.woff2 "$TMP/fonts/"
cp "$ROOT/vendor/zxing-decoder.js" "$ROOT/vendor/zxing_reader.wasm" "$TMP/vendor/"

# Validate manifest + vendor + zip allowlist
python3 - <<'PY'
import json, os, zipfile

m = json.load(open("dist/staging/manifest.json"))
assert m["manifest_version"] == 3
assert m["version"] == "2.5.4", m["version"]
assert "tabs" in m.get("permissions", []), "tabs permission required for scanner tab return"
assert "<all_urls>" not in m.get("host_permissions", []), "<all_urls> should stay removed"
assert "file:///*" in m.get("host_permissions", []), "file:///* required for local PDFs"
csp = m.get("content_security_policy", {}).get("extension_pages", "")
assert "wasm-unsafe-eval" in csp, "CSP must allow wasm-unsafe-eval"
assert len(m["description"]) <= 132, f"description too long: {len(m['description'])}"
assert len(m["name"]) <= 75, f"name too long: {len(m['name'])}"
need = ["activeTab", "storage", "contextMenus", "tabs"]
for p in need:
    assert p in m["permissions"], f"missing {p}"
assert os.path.isfile("dist/staging/vendor/zxing-decoder.js"), "missing zxing-decoder.js"
assert os.path.isfile("dist/staging/vendor/zxing_reader.wasm"), "missing zxing_reader.wasm"
assert os.path.getsize("dist/staging/vendor/zxing_reader.wasm") > 100_000

ALLOWED = {
    "manifest.json",
    "background.js",
    "cropper.html",
    "cropper.js",
    "decoder.js",
    "payload.js",
    "history.js",
    "settings.js",
    "styles.css",
    "index.html",
    "icons/icon16.png",
    "icons/icon48.png",
    "icons/icon128.png",
    "fonts/IBMPlexSans-Regular.woff2",
    "fonts/IBMPlexSans-Medium.woff2",
    "fonts/IBMPlexSans-SemiBold.woff2",
    "fonts/IBMPlexMono-Regular.woff2",
    "vendor/zxing-decoder.js",
    "vendor/zxing_reader.wasm",
}
FORBIDDEN_SUBSTR = (
    "store-assets",
    "screenshot",
    "promo",
    "node_modules",
    "src/",
    "scripts/",
    ".md",
    ".svg",
    "icon512",
    "logo-source",
    "package.json",
    ".git",
)

staging_files = []
for root, dirs, files in os.walk("dist/staging"):
    dirs[:] = [d for d in dirs if d != ".DS_Store"]
    for name in files:
        if name == ".DS_Store":
            continue
        rel = os.path.relpath(os.path.join(root, name), "dist/staging").replace("\\", "/")
        staging_files.append(rel)

unexpected = [f for f in staging_files if f not in ALLOWED]
missing = sorted(ALLOWED - set(staging_files))
assert not unexpected, f"staging has extra files: {unexpected}"
assert not missing, f"staging missing files: {missing}"
for f in staging_files:
    low = f.lower()
    for bad in FORBIDDEN_SUBSTR:
        assert bad not in low, f"forbidden path in staging: {f}"

print("manifest OK —", m["name"], m["version"])
print("description length:", len(m["description"]))
print("permissions:", m["permissions"])
print("host_permissions:", m.get("host_permissions"))
print("CSP:", csp)
print("runtime files:", len(staging_files))
PY

rm -f "$OUT"
(
  cd "$TMP"
  zip -r -q "$OUT" . \
    -x "*.DS_Store" \
    -x "**/.DS_Store"
)

python3 - <<'PY'
import zipfile
FORBIDDEN_SUBSTR = (
    "store-assets",
    "screenshot",
    "promo",
    "node_modules",
    "src/",
    "scripts/",
    ".md",
    ".svg",
    "icon512",
    "logo-source",
    "package.json",
)
with zipfile.ZipFile("dist/qrsnip-chrome-store.zip") as z:
    names = [n for n in z.namelist() if not n.endswith("/")]
    for n in names:
        low = n.lower()
        for bad in FORBIDDEN_SUBSTR:
            assert bad not in low, f"forbidden path in zip: {n}"
print("zip OK —", len(names), "files, no store screenshots or extras")
PY

echo "Created: $OUT"
unzip -l "$OUT"
