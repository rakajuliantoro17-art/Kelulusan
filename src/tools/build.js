#!/usr/bin/env node
"use strict";

/*
 * Build statis PINTUKU untuk Vercel.
 *
 * Vercel hanya mempublikasikan isi direktori output. Struktur repo menaruh semua kode
 * di src/ dan hanya aset publik di public/, jadi skrip ini merakit dist/:
 *
 *   public/**                 -> dist/**            (apa adanya)
 *   src/** (disaring)         -> dist/src/**        (hanya berkas yang memang dimuat browser)
 *
 * Rewrite di vercel.json (mis. "/akademik/" -> "/src/akademik/index.html") tetap berlaku
 * karena jalur /src/... kembali ada di output. Kode server TIDAK ikut dipublikasikan:
 * folder api/, _lib/, server/, scripts/, appscript/, docs/, tools/ dan seluruh src/Sarpras
 * (modul itu masih tahap audit dan butuh build Vite sendiri) dilewati, begitu juga
 * berkas non-web (.md, .gs, .rules, .xlsx, package.json, vercel.json, dll).
 *
 * Tanpa dependency npm. Keluar dengan kode 1 jika titik masuk wajib tidak ada atau
 * ada kode server yang bocor ke output.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const SRC = path.join(ROOT, "src");
const PUBLIC = path.join(ROOT, "public");
const OUT = path.join(ROOT, "dist");

const SKIP_DIRS = new Set(["api", "_lib", "server", "scripts", "appscript", "docs", "tools", "node_modules", ".git"]);
const SKIP_SRC_TOP = new Set(["Sarpras"]);
const SKIP_FILES = new Set(["package.json", "package-lock.json", "vercel.json", "firebase.json"]);
const WEB_EXT = new Set([
  ".html", ".css", ".js", ".mjs", ".json", ".webmanifest",
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".avif", ".ico",
  ".woff", ".woff2", ".ttf", ".otf", ".mp3", ".mp4", ".webm", ".txt"
]);

const REQUIRED = [
  "src/pintuku/dashboard/index.html",
  "src/pintuku/dashboard/sarpras.html",
  "src/pintuku/pwa/sw.js",
  "src/pintuku/pwa/manifest.json",
  "src/pintuku/assets/css/portal.css",
  "src/pintuku/assets/js/portal.js",
  "src/akademik/index.html",
  "src/akademik/dashboard/index.html",
  "src/kesiswaan/index.html"
];

let copied = 0;

function copyFile(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  copied += 1;
}

function walk(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) visit(full, entry, true);
    else if (entry.isFile()) visit(full, entry, false);
  }
}

function copyPublic(from, to) {
  walk(from, (full, entry, isDir) => {
    const target = path.join(to, entry.name);
    if (isDir) copyPublic(full, target);
    else copyFile(full, target);
  });
}

function copySrc(from, to, depth) {
  walk(from, (full, entry, isDir) => {
    const target = path.join(to, entry.name);
    if (isDir) {
      if (SKIP_DIRS.has(entry.name)) return;
      if (depth === 0 && SKIP_SRC_TOP.has(entry.name)) return;
      copySrc(full, target, depth + 1);
      return;
    }
    if (SKIP_FILES.has(entry.name)) return;
    if (!WEB_EXT.has(path.extname(entry.name).toLowerCase())) return;
    copyFile(full, target);
  });
}

function listFiles(dir, base = dir, acc = []) {
  walk(dir, (full, entry, isDir) => {
    if (isDir) listFiles(full, base, acc);
    else acc.push(path.relative(base, full).split(path.sep).join("/"));
  });
  return acc;
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

if (fs.existsSync(PUBLIC)) copyPublic(PUBLIC, OUT);
copySrc(SRC, path.join(OUT, "src"), 0);

const problems = [];
for (const rel of REQUIRED) {
  if (!fs.existsSync(path.join(OUT, rel))) problems.push("titik masuk hilang di output: " + rel);
}
const leaked = listFiles(OUT).filter((f) =>
  /^src\/(server|Sarpras)\//.test(f) || /^src\/[^/]+\/api\//.test(f) || /\/_lib\//.test(f));
leaked.forEach((f) => problems.push("kode server bocor ke output: " + f));

if (problems.length) {
  problems.forEach((p) => console.error("BUILD GAGAL: " + p));
  process.exit(1);
}
console.log("Build selesai: " + copied + " berkas -> dist/");
