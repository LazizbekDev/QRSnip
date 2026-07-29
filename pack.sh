#!/usr/bin/env bash
# Build a Chrome Web Store–ready zip (no .git, docs, or junk).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$ROOT/dist/qrsnip-chrome-store.zip"
TMP="$ROOT/dist/staging"

# Ensure ZXing vendor bundle exists
if [[ ! -f "$ROOT/vendor/zxing-decoder.js" || ! -f "$ROOT/vendor/zxing_reader.wasm" ]]; then
  echo "Building ZXing decoder vendor…"
  (cd "$ROOT" && npm run build:decoder)
fi

rm -rf "$TMP"
mkdir -p "$TMP" "$ROOT/dist"

# Runtime files only
cp "$ROOT/manifest.json" "$TMP/"
cp "$ROOT/background.js" "$TMP/"
cp "$ROOT/cropper.html" "$TMP/"
cp "$ROOT/cropper.js" "$TMP/"
cp "$ROOT/decoder.js" "$TMP/"
cp "$ROOT/payload.js" "$TMP/"
cp "$ROOT/history.js" "$TMP/"
cp "$ROOT/styles.css" "$TMP/"
cp "$ROOT/index.html" "$TMP/"

mkdir -p "$TMP/icons" "$TMP/fonts" "$TMP/vendor"
cp "$ROOT/icons/icon16.png" "$ROOT/icons/icon48.png" "$ROOT/icons/icon128.png" "$TMP/icons/"
cp "$ROOT"/fonts/*.woff2 "$TMP/fonts/"
cp "$ROOT/vendor/zxing-decoder.js" "$ROOT/vendor/zxing_reader.wasm" "$TMP/vendor/"

# Validate manifest + vendor
python3 - <<'PY'
import json, os, sys
m = json.load(open("dist/staging/manifest.json"))
assert m["manifest_version"] == 3
assert m["version"] == "2.2.0", m["version"]
assert "tabs" not in m.get("permissions", []), "tabs permission should be removed"
assert "<all_urls>" not in m.get("host_permissions", []), "<all_urls> should stay removed"
assert "file:///*" in m.get("host_permissions", []), "file:///* required for local PDFs"
csp = m.get("content_security_policy", {}).get("extension_pages", "")
assert "wasm-unsafe-eval" in csp, "CSP must allow wasm-unsafe-eval"
assert len(m["description"]) <= 132, f"description too long: {len(m['description'])}"
assert len(m["name"]) <= 75, f"name too long: {len(m['name'])}"
need = ["activeTab", "storage", "contextMenus"]
for p in need:
    assert p in m["permissions"], f"missing {p}"
assert os.path.isfile("dist/staging/vendor/zxing-decoder.js"), "missing zxing-decoder.js"
assert os.path.isfile("dist/staging/vendor/zxing_reader.wasm"), "missing zxing_reader.wasm"
assert os.path.getsize("dist/staging/vendor/zxing_reader.wasm") > 100_000
print("manifest OK —", m["name"], m["version"])
print("description length:", len(m["description"]))
print("permissions:", m["permissions"])
print("host_permissions:", m.get("host_permissions"))
print("CSP:", csp)
PY

rm -f "$OUT"
(
  cd "$TMP"
  zip -r -q "$OUT" . \
    -x "*.DS_Store" \
    -x "**/.DS_Store"
)

echo "Created: $OUT"
unzip -l "$OUT" | head -40
