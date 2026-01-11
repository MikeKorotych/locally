#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const root = process.cwd();
const args = process.argv.slice(2);
const stagedOnly = args.includes("--staged");

function keyToName(key) {
  if (key.startsWith("@")) {
    const idx = key.indexOf("@", 1);
    return key.slice(0, idx);
  }
  const idx = key.indexOf("@");
  return idx === -1 ? key : key.slice(0, idx);
}

function parseYarnLock(lockPath) {
  const map = {};
  if (!fs.existsSync(lockPath)) return map;
  const lines = fs.readFileSync(lockPath, "utf8").split(/\r?\n/);
  let currentKey = null;
  for (const line of lines) {
    const keyMatch = line.match(/^"([^"]+)":$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      continue;
    }
    if (currentKey) {
      const verMatch = line.match(/^\s+version:\s+(.+)$/);
      if (verMatch) {
        const version = verMatch[1].trim().replace(/^"|"$/g, "");
        const name = keyToName(currentKey);
        if (!map[name]) map[name] = version;
        currentKey = null;
      }
    }
  }
  return map;
}

function getStagedPackageJsons() {
  try {
    const out = execSync("git diff --cached --name-only --diff-filter=ACM", {
      encoding: "utf8",
    });
    const repoRoot = (function() {
      try {
        return execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();
      } catch (e) {
        return process.cwd();
      }
    })();

    return out
      .split(/\r?\n/)
      .filter(Boolean)
      .filter((p) => path.basename(p) === "package.json")
      .map((p) => path.resolve(repoRoot, p));
  } catch (e) {
    return [];
  }
}

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name === "package.json") out.push(full);
  }
  return out;
}

const lockMap = parseYarnLock(path.join(root, "yarn.lock"));

let files = [];
if (stagedOnly) {
  files = getStagedPackageJsons();
  if (files.length === 0) {
    console.log("No staged package.json files to check — skipping static package check.");
    process.exit(0);
  }
} else {
  files = walk(root);
}

const bad = [];
for (const f of files) {
  try {
    const pkg = JSON.parse(fs.readFileSync(f, "utf8"));
    [
      "dependencies",
      "devDependencies",
      "peerDependencies",
      "optionalDependencies",
    ].forEach((sec) => {
      const deps = pkg[sec] || {};
      Object.entries(deps).forEach(([name, ver]) => {
        if (typeof ver !== "string") return;
        if (/^[~^*]|[><]|\bx\b|\|\||\s-\s/.test(String(ver))) {
          const suggested = lockMap[name] || null;
          bad.push({ file: f, section: sec, name, ver, suggested });
        }
      });
    });
  } catch (e) {
    console.error(`Failed to parse ${f}: ${e.message}`);
    process.exitCode = 1;
  }
}

if (bad.length) {
  const byFile = bad.reduce((acc, b) => {
    acc[b.file] = acc[b.file] || [];
    acc[b.file].push(b);
    return acc;
  }, {});

  console.error("Static package policy violation: the following dependencies use non-exact versions:");
  for (const [file, items] of Object.entries(byFile)) {
    console.error(`\n${path.relative(root, file)}:`);
    for (const it of items) {
      const suggestion = it.suggested ? `${it.suggested} (from yarn.lock)` : `not found in yarn.lock`;
      console.error(`  • ${it.name}: ${it.ver} -> suggested pin: ${suggestion}`);
    }
  }
  console.error(`\nPlease pin these to exact versions before committing. (Run 'yarn install' to ensure yarn.lock is present and then update the package.json or run a helper to pin them.)`);
  process.exit(1);
}

console.log("No non-exact dependency versions found ✅");
process.exit(0);
