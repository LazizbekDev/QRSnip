#!/usr/bin/env node
import * as esbuild from "esbuild";
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const vendor = join(root, "vendor");

mkdirSync(vendor, { recursive: true });

await esbuild.build({
  entryPoints: [join(root, "src/zxing-entry.js")],
  bundle: true,
  format: "iife",
  globalName: "QRSnipZXing",
  outfile: join(vendor, "zxing-decoder.js"),
  platform: "browser",
  target: ["chrome110"],
  logLevel: "info",
});

const wasmSrc = join(
  root,
  "node_modules/zxing-wasm/dist/reader/zxing_reader.wasm"
);
const wasmDest = join(vendor, "zxing_reader.wasm");

if (!existsSync(wasmSrc)) {
  console.error("Missing zxing_reader.wasm — run npm install first");
  process.exit(1);
}

copyFileSync(wasmSrc, wasmDest);
console.log("Wrote vendor/zxing-decoder.js");
console.log("Wrote vendor/zxing_reader.wasm");
