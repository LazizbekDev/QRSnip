#!/usr/bin/env bash
# Build a Chrome Web Store–ready zip (no .git, docs, or junk).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$ROOT/dist/qrsnip-chrome-store.zip"
TMP="$ROOT/dist/staging"

rm -rf "$TMP"
mkdir -p "$TMP" "$ROOT/dist"

# Runtime files only
cp "$ROOT/manifest.json" "$TMP/"
cp "$ROOT/background.js" "$TMP/"
cp "$ROOT/cropper.html" "$TMP/"
cp "$ROOT/cropper.js" "$TMP/"
cp "$ROOT/payload.js" "$TMP/"
cp "$ROOT/history.js" "$TMP/"
cp "$ROOT/styles.css" "$TMP/"
cp "$ROOT/index.html" "$TMP/"

mkdir -p "$TMP/icons" "$TMP/fonts"
cp "$ROOT/icons/icon16.png" "$ROOT/icons/icon48.png" "$ROOT/icons/icon128.png" "$TMP/icons/"
cp "$ROOT"/fonts/*.woff2 "$TMP/fonts/"

# Validate manifest
python3 - <<'PY'
import json, sys
m = json.load(open("dist/staging/manifest.json"))
assert m["manifest_version"] == 3
assert "tabs" not in m.get("permissions", []), "tabs permission should be removed"
assert "<all_urls>" not in m.get("host_permissions", []), "<all_urls> should stay removed"
assert "file:///*" in m.get("host_permissions", []), "file:///* required for local PDFs"
assert len(m["description"]) <= 132, f"description too long: {len(m['description'])}"
assert len(m["name"]) <= 75, f"name too long: {len(m['name'])}"
need = ["activeTab", "storage", "contextMenus"]
for p in need:
    assert p in m["permissions"], f"missing {p}"
print("manifest OK —", m["name"], m["version"])
print("description length:", len(m["description"]))
print("permissions:", m["permissions"])
print("host_permissions:", m.get("host_permissions"))
PY

rm -f "$OUT"
(
  cd "$TMP"
  zip -r -q "$OUT" . \
    -x "*.DS_Store" \
    -x "**/.DS_Store"
)

echo "Created: $OUT"
unzip -l "$OUT"
