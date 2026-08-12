#!/usr/bin/env node
/**
 * check-unused-permissions.mjs
 * Static scan: manifest permissions vs chrome.* / browser.* usage in sources.
 *
 * Usage:
 *   node scripts/check-unused-permissions.mjs [--root .] [--manifest path] [--strict]
 */

import fs from "node:fs";
import path from "node:path";
import { matchPermission, matchHostPermission } from "./lib/permission-map.mjs";

const IGNORE_DIRS = new Set([
  "node_modules",
  "dist",
  "vendor",
  ".git",
  "store-assets",
  "fonts",
  "icons",
]);

/** Analyzer sources contain chrome.* strings in regexes — never scan them. */
const IGNORE_FILES = new Set([
  "permission-map.mjs",
  "check-unused-permissions.mjs",
]);

const SOURCE_EXT = new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".jsx",
  ".html",
  ".htm",
  ".vue",
  ".svelte",
]);

const COLORS = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

function color(name, text) {
  if (!process.stdout.isTTY) return text;
  return `${COLORS[name] || ""}${text}${COLORS.reset}`;
}

function parseArgs(argv) {
  const opts = { root: process.cwd(), manifest: null, strict: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--strict") opts.strict = true;
    else if (a === "--root") opts.root = path.resolve(argv[++i] || ".");
    else if (a === "--manifest") opts.manifest = path.resolve(argv[++i] || "");
    else if (a === "--help" || a === "-h") opts.help = true;
    else {
      console.error(`Unknown argument: ${a}`);
      process.exit(2);
    }
  }
  return opts;
}

function printHelp() {
  console.log(`Usage: node scripts/check-unused-permissions.mjs [options]

Options:
  --root <dir>       Extension root (default: cwd)
  --manifest <path>  Path to manifest.json
  --strict           Fail on inconclusive host_permissions
  -h, --help         Show help
`);
}

function findManifest(root, explicit) {
  if (explicit) {
    if (!fs.existsSync(explicit)) {
      throw new Error(`Manifest not found: ${explicit}`);
    }
    return explicit;
  }
  const candidates = [
    path.join(root, "manifest.json"),
    path.join(root, "public", "manifest.json"),
    path.join(root, "src", "manifest.json"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error(`No manifest.json under ${root}`);
}

function walkSources(root, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    if (ent.name.startsWith(".") && ent.name !== ".") continue;
    const full = path.join(root, ent.name);
    if (ent.isDirectory()) {
      if (IGNORE_DIRS.has(ent.name)) continue;
      walkSources(full, out);
    } else if (ent.isFile()) {
      if (IGNORE_FILES.has(ent.name)) continue;
      const ext = path.extname(ent.name).toLowerCase();
      if (SOURCE_EXT.has(ext)) out.push(full);
    }
  }
  return out;
}

function readManifest(manifestPath) {
  const raw = fs.readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(raw);
  const permissions = [
    ...(Array.isArray(manifest.permissions) ? manifest.permissions : []),
    ...(Array.isArray(manifest.optional_permissions)
      ? manifest.optional_permissions
      : []),
  ];
  // MV2 leftover
  if (Array.isArray(manifest.optional_host_permissions)) {
    // hosts handled separately
  }
  const hosts = [
    ...(Array.isArray(manifest.host_permissions)
      ? manifest.host_permissions
      : []),
    ...(Array.isArray(manifest.optional_host_permissions)
      ? manifest.optional_host_permissions
      : []),
  ];
  // MV2: permissions sometimes included host patterns
  const apiPerms = [];
  const embeddedHosts = [];
  for (const p of permissions) {
    if (
      typeof p === "string" &&
      (p.includes("://") || p === "<all_urls>" || p.startsWith("file:"))
    ) {
      embeddedHosts.push(p);
    } else if (typeof p === "string") {
      apiPerms.push(p);
    }
  }
  return {
    name: manifest.name || path.basename(path.dirname(manifestPath)),
    version: manifest.version || "",
    apiPerms: [...new Set(apiPerms)],
    hosts: [...new Set([...hosts, ...embeddedHosts])],
  };
}

function loadSourceBundle(files) {
  const parts = [];
  for (const file of files) {
    try {
      parts.push(fs.readFileSync(file, "utf8"));
    } catch {
      // skip unreadable
    }
  }
  return parts.join("\n");
}

function check(opts) {
  const manifestPath = findManifest(opts.root, opts.manifest);
  const { name, version, apiPerms, hosts } = readManifest(manifestPath);
  const files = walkSources(opts.root);
  const source = loadSourceBundle(files);

  /** @type {{ perm: string, reason: string }[]} */
  const used = [];
  /** @type {string[]} */
  const unused = [];

  for (const perm of apiPerms) {
    const result = matchPermission(perm, source);
    if (result.used) used.push({ perm, reason: result.reason || perm });
    else unused.push(perm);
  }

  /** @type {{ host: string, status: string }[]} */
  const hostResults = [];
  for (const host of hosts) {
    const status = matchHostPermission(host, source);
    hostResults.push({ host, status });
  }

  return {
    name,
    version,
    manifestPath,
    fileCount: files.length,
    apiPerms,
    used,
    unused,
    hostResults,
  };
}

function report(result, { strict }) {
  const title = `${result.name}${result.version ? ` v${result.version}` : ""}`;
  console.log(color("bold", `\n${title} — permissions check`));
  console.log(
    color("dim", `Manifest: ${result.manifestPath} · scanned ${result.fileCount} files`)
  );

  const declaredApi =
    result.apiPerms.length > 0 ? result.apiPerms.join(", ") : "(none)";
  const declaredHosts =
    result.hostResults.length > 0
      ? result.hostResults.map((h) => h.host).join(", ")
      : "(none)";
  console.log(`Declared: ${declaredApi}`);
  console.log(`Hosts:    ${declaredHosts}`);

  if (result.used.length) {
    console.log(
      color("green", "Used:     ") +
        result.used.map((u) => `${u.perm} (${u.reason})`).join(", ")
    );
  } else if (result.apiPerms.length === 0) {
    console.log(color("dim", "Used:     (no API permissions declared)"));
  } else {
    console.log(color("yellow", "Used:     (none matched)"));
  }

  if (result.unused.length) {
    console.log(color("red", "UNUSED:   ") + result.unused.join(", "));
  } else {
    console.log(color("green", "Unused:   (none)"));
  }

  for (const h of result.hostResults) {
    if (h.status === "matched") {
      console.log(color("green", `Host:     ${h.host} — matched in sources`));
    } else {
      console.log(
        color("yellow", `Host:     ${h.host} — inconclusive (manual review)`)
      );
    }
  }

  const hostFail =
    strict &&
    result.hostResults.some((h) => h.status === "inconclusive");

  if (result.unused.length || hostFail) {
    console.log(color("red", "\nFAIL — remove unused permissions or justify hosts\n"));
    return 1;
  }

  console.log(color("green", "\nOK\n"));
  return 0;
}

function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    printHelp();
    process.exit(0);
  }

  try {
    const result = check(opts);
    const code = report(result, opts);
    process.exit(code);
  } catch (err) {
    console.error(color("red", `Error: ${err.message || err}`));
    process.exit(2);
  }
}

main();
