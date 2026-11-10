"use strict";

/*
 * PINTUKU Sarpras — spreadsheet-backed authentication.
 * Reads only the private "Pengguna" tab using the Google service account.
 * Credentials never leave the server. Session tokens are HMAC-SHA256,
 * tab-scoped in the browser, and expire after 8 hours.
 *
 * Required environment:
 *   GOOGLE_SHEET_ID_SARPRAS
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL
 *   GOOGLE_SERVICE_ACCOUNT_KEY
 *   SARPRAS_SESSION_SECRET
 */
const crypto = require("crypto");

const TTL_SECONDS = 8 * 60 * 60;
const MAX_FAILS = 5;
const WINDOW_MS = 10 * 60 * 1000;
const failures = new Map();
let googleToken = { value: "", expiresAt: 0 };

const INACTIVE = new Set(["tidak", "nonaktif", "non-aktif", "no", "n", "false", "0", "off"]);
const ROLE_MAP = new Map([
  ["admin sarpras", "admin_sarpras"], ["administrator sarpras", "admin_sarpras"], ["admin", "admin_sarpras"],
  ["staff sarpras", "staff_sarpras"], ["staf sarpras", "staff_sarpras"], ["petugas sarpras", "staff_sarpras"],
  ["arsiparis", "arsiparis"],
  ["waka sarpras", "wakasek_sarpras"], ["wakasek sarpras", "wakasek_sarpras"], ["wakil kepala sekolah sarpras", "wakasek_sarpras"],
  ["kepala sekolah", "principal"], ["principal", "principal"],
  ["operator", "operator"], ["operator ruangan", "operator"],
  ["guru", "teacher"], ["teacher", "teacher"],
  ["wali kelas", "homeroom_teacher"], ["homeroom teacher", "homeroom_teacher"]
]);

function send(res, status, body) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.status(status).json(body);
}
function config() {
  return {
    sheetId: String(process.env.GOOGLE_SHEET_ID_SARPRAS || "").trim(),
    email: String(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "").trim(),
    key: String(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "").replace(/\\n/g, "\n"),
    secret: String(process.env.SARPRAS_SESSION_SECRET || "")
  };
}
function b64url(value) {
  return Buffer.from(value).toString("base64url");
}
function sha(value) {
  return crypto.createHash("sha256").update(String(value)).digest();
}
function safeEqual(a, b) {
  return crypto.timingSafeEqual(sha(a), sha(b));
}
function roleCode(value) {
  const key = String(value || "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  return ROLE_MAP.get(key) || "";
}
function clientKey(req, username) {
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    (req.socket && req.socket.remoteAddress) || "unknown";
  return ip + ":" + username.toLowerCase().slice(0, 80);
}
function failedCount(key) {
  const item = failures.get(key);
  if (!item || Date.now() > item.resetAt) {
    failures.delete(key);
    return 0;
  }
  return item.count;
}
function addFailure(key) {
  const item = failures.get(key);
  if (!item || Date.now() > item.resetAt) failures.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
  else item.count += 1;
}
function clearFailure(key) {
  failures.delete(key);
}
async function getGoogleToken(c) {
  const now = Math.floor(Date.now() / 1000);
  if (googleToken.value && googleToken.expiresAt > now + 60) return googleToken.value;
  const encode = value => Buffer.from(value).toString("base64url");
  const unsigned = encode(JSON.stringify({ alg: "RS256", typ: "JWT" })) + "." +
    encode(JSON.stringify({
      iss: c.email,
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600
    }));
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: unsigned + "." + signer.sign(c.key).toString("base64url")
    }),
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error("google_token_unavailable");
  const data = await response.json();
  googleToken = { value: data.access_token, expiresAt: now + Number(data.expires_in || 3600) };
  return googleToken.value;
}
async function loadUsers(c) {
  const token = await getGoogleToken(c);
  const range = encodeURIComponent("Pengguna!A:G");
  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets/" +
    encodeURIComponent(c.sheetId) + "/values/" + range + "?valueRenderOption=FORMATTED_VALUE", {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
      signal: AbortSignal.timeout(10000)
    });
  if (!response.ok) throw new Error("sarpras_user_sheet_unavailable");
  const data = await response.json();
  const values = Array.isArray(data.values) ? data.values : [];
  if (!values.length) throw new Error("sarpras_user_sheet_empty");
  const headers = values[0].map(value => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, ""));
  const index = {
    username: headers.indexOf("username"),
    nama: headers.indexOf("nama"),
    password: headers.indexOf("password"),
    status: headers.indexOf("status"),
    peran: headers.indexOf("peran")
  };
  if (Object.values(index).some(value => value < 0)) throw new Error("sarpras_user_sheet_headers_invalid");
  return values.slice(1).map(row => ({
    username: String(row[index.username] || "").trim(),
    nama: String(row[index.nama] || "").trim(),
    password: String(row[index.password] || "").trim(),
    status: String(row[index.status] || "").trim().toLowerCase(),
    peran: String(row[index.peran] || "").trim()
  })).filter(user => user.username && user.password && !INACTIVE.has(user.status));
}
function passwordMatches(stored, given) {
  const strong = /^scrypt:([0-9a-f]{32}):([0-9a-f]{128})$/i.exec(stored);
  if (strong) {
    const salt = Buffer.from(strong[1], "hex");
    const expected = Buffer.from(strong[2], "hex");
    const actual = crypto.scryptSync(String(given), salt, 64);
    return crypto.timingSafeEqual(expected, actual);
  }
  const match = /^sha256:([0-9a-f]{64})$/i.exec(stored);
  if (match) {
    const expected = Buffer.from(match[1], "hex");
    const actual = sha(given);
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  }
  // Plaintext remains supported only for compatibility with the initial account sheet.
  return safeEqual(given, stored);
}
function sign(payload, secret) {
  const body = b64url(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return body + "." + signature;
}
function verifyToken(token, secret) {
  const parts = String(token || "").split(".");
  if (parts.length !== 2) return null;
  const expected = crypto.createHmac("sha256", secret).update(parts[0]).digest();
  let actual;
  try { actual = Buffer.from(parts[1], "base64url"); } catch (_) { return null; }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
  let payload;
  try { payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8")); } catch (_) { return null; }
  if (!payload || !Number.isFinite(payload.exp) || Math.floor(Date.now() / 1000) >= payload.exp) return null;
  if (typeof payload.u !== "string" || typeof payload.n !== "string" || typeof payload.r !== "string") return null;
  return payload;
}
function bearer(req) {
  const value = req.headers && req.headers.authorization;
  const match = typeof value === "string" ? value.match(/^Bearer\s+([^\s]+)$/i) : null;
  return match ? match[1] : "";
}
function publicSession(token, payload) {
  return {
    token,
    exp: payload.exp,
    expires_at: payload.exp,
    username: payload.u,
    nama: payload.n,
    role: payload.r,
    roles: [payload.r]
  };
}
async function login(req, res, c) {
  if (!c.sheetId || !c.email || !c.key || !c.secret) {
    return send(res, 503, {
      success: false,
      code: "sarpras_auth_not_configured",
      message: "Login Sarpras belum dikonfigurasi. Administrator perlu memeriksa GOOGLE_SHEET_ID_SARPRAS, kredensial Service Account, dan SARPRAS_SESSION_SECRET."
    });
  }
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!username || username.length > 80 || !password || password.length > 256) {
    return send(res, 400, { success: false, code: "invalid_credentials_format", message: "Username dan kata sandi wajib diisi." });
  }
  const key = clientKey(req, username);
  if (failedCount(key) >= MAX_FAILS) {
    return send(res, 429, { success: false, code: "login_rate_limited", message: "Terlalu banyak percobaan gagal. Coba kembali dalam 10 menit." });
  }
  try {
    const users = await loadUsers(c);
    const user = users.find(item => item.username.toLowerCase() === username.toLowerCase());
    const passOk = passwordMatches(user ? user.password : "account-not-found-dummy", password);
    const role = user ? roleCode(user.peran) : "";
    if (!user || !passOk || !role) {
      addFailure(key);
      await new Promise(resolve => setTimeout(resolve, 350));
      return send(res, 401, {
        success: false,
        code: user && passOk ? "sarpras_role_unrecognized" : "authentication_failed",
        message: user && passOk ? "Peran akun belum dikenali. Periksa kolom Peran pada tab Pengguna." : "Username atau kata sandi salah, atau akun tidak aktif."
      });
    }
    clearFailure(key);
    const now = Math.floor(Date.now() / 1000);
    const payload = { u: user.username, n: user.nama || user.username, r: role, iat: now, exp: now + TTL_SECONDS };
    const token = sign(payload, c.secret);
    return send(res, 200, { success: true, session: publicSession(token, payload) });
  } catch (error) {
    const known = error && error.message;
    const message = known === "sarpras_user_sheet_headers_invalid" || known === "sarpras_user_sheet_empty"
      ? "Tab Pengguna Sarpras belum memiliki header atau data akun dengan format yang sesuai."
      : "Data akun Sarpras tidak dapat dibaca. Periksa akses Viewer Service Account pada spreadsheet.";
    return send(res, 503, { success: false, code: known || "sarpras_auth_unavailable", message });
  }
}
function verify(req, res, c) {
  if (!c.secret) return send(res, 503, { valid: false, code: "sarpras_auth_not_configured", message: "Verifikasi sesi Sarpras belum dikonfigurasi." });
  const payload = verifyToken(bearer(req), c.secret);
  if (!payload) return send(res, 401, { valid: false, code: "session_invalid", message: "Sesi tidak valid atau telah kedaluwarsa." });
  const session = publicSession(bearer(req), payload);
  return send(res, 200, {
    valid: true,
    session,
    user: { username: payload.u, nama: payload.n },
    roles: [{ role_code: payload.r }],
    role: payload.r
  });
}

const INVENTORY_ROLES = new Set(["admin_sarpras", "staff_sarpras", "arsiparis"]);
async function assetsList(req, res, c) {
  if (!c.secret) return send(res, 503, { success: false, code: "sarpras_auth_not_configured", message: "Sesi Sarpras belum dikonfigurasi." });
  const payload = verifyToken(bearer(req), c.secret);
  if (!payload) return send(res, 401, { success: false, code: "session_invalid", message: "Sesi tidak valid atau telah kedaluwarsa." });
  if (!INVENTORY_ROLES.has(payload.r)) return send(res, 403, { success: false, code: "forbidden", message: "Peran akun tidak memiliki akses ke daftar inventaris." });
  if (!c.sheetId || !c.email || !c.key) return send(res, 503, { success: false, code: "sarpras_sheet_not_configured", message: "Spreadsheet Sarpras belum dikonfigurasi." });
  try {
    const rows = await readTab(c, "Aset", "A:O");
    const limit = Math.min(1000, Math.max(1, Number(req.query && req.query.limit) || 500));
    return send(res, 200, { success: true, source: "Google Sheets · tab Aset", generated_at: new Date().toISOString(), total: rows.length, items: rows.slice(0, limit) });
  } catch (error) {
    return send(res, 503, { success: false, code: (error && error.message) || "sarpras_assets_unavailable", message: "Daftar aset tidak dapat dibaca. Periksa tab Aset pada spreadsheet Sarpras." });
  }
}
const SUMMARY_ROLES = new Set(["admin_sarpras", "staff_sarpras", "arsiparis", "wakasek_sarpras", "principal"]);
async function readTab(c, tab, range) {
  const token = await getGoogleToken(c);
  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets/" + encodeURIComponent(c.sheetId) +
    "/values/" + encodeURIComponent(tab + "!" + range) + "?valueRenderOption=UNFORMATTED_VALUE", {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
      signal: AbortSignal.timeout(10000)
    });
  if (!response.ok) throw new Error("sarpras_tab_unavailable_" + tab);
  const data = await response.json();
  const rows = Array.isArray(data.values) ? data.values : [];
  if (!rows.length) return [];
  const head = rows[0].map(v => String(v || "").trim());
  return rows.slice(1).map(row => {
    const o = {};
    head.forEach((h, k) => { if (h) o[h] = row[k] === undefined ? "" : row[k]; });
    return o;
  }).filter(o => Object.values(o).some(v => String(v).trim() !== ""));
}
function bump(map, key, by) {
  const k = String(key || "").trim() || "Tidak diisi";
  map[k] = (map[k] || 0) + by;
}
function sorted(map, limit) {
  const list = Object.entries(map).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  return limit ? list.slice(0, limit) : list;
}
async function summary(req, res, c) {
  if (!c.secret) return send(res, 503, { success: false, code: "sarpras_auth_not_configured", message: "Sesi Sarpras belum dikonfigurasi." });
  const payload = verifyToken(bearer(req), c.secret);
  if (!payload) return send(res, 401, { success: false, code: "session_invalid", message: "Sesi tidak valid atau telah kedaluwarsa." });
  if (!SUMMARY_ROLES.has(payload.r)) return send(res, 403, { success: false, code: "forbidden", message: "Peran akun tidak memiliki akses ke ringkasan aset." });
  if (!c.sheetId || !c.email || !c.key) return send(res, 503, { success: false, code: "sarpras_auth_not_configured", message: "Spreadsheet Sarpras belum dikonfigurasi." });
  try {
    const [aset, ruangan, log] = await Promise.all([
      readTab(c, "Aset", "A:O"), readTab(c, "Ruangan", "A:E"), readTab(c, "Log_Aktivitas", "A:D")
    ]);
    const kondisi = { Baik: 0, "Rusak Ringan": 0, "Rusak Berat": 0 };
    const dana = {}, jenis = {}, tahun = {}, ruang = {};
    const nameOf = new Map(ruangan.map(r => [String(r.Kode_Ruang), String(r.Nama_Ruangan || r.Kode_Ruang)]));
    let nilai = 0, unit = 0, tanpaRuang = 0;
    for (const r of aset) {
      const qty = Number(r.Jumlah) > 0 ? Number(r.Jumlah) : 1;
      const value = Number(r.Nilai) || 0;
      unit += qty; nilai += value;
      if (kondisi[r.Kondisi] !== undefined) kondisi[r.Kondisi] += qty; else bump(kondisi, r.Kondisi, qty);
      bump(dana, r.Sumber_Dana, value); bump(jenis, r.Jenis_Barang, qty); bump(tahun, r.Tahun, qty);
      if (r.Kode_Ruang) bump(ruang, nameOf.get(String(r.Kode_Ruang)) || r.Kode_Ruang, qty); else tanpaRuang += qty;
    }
    const baik = kondisi.Baik || 0;
    const ringan = kondisi["Rusak Ringan"] || 0, berat = kondisi["Rusak Berat"] || 0;
    const perlu = ringan + berat;
    const dinilai = baik + perlu;
    const belumDinilai = Math.max(unit - dinilai, 0);
    return send(res, 200, {
      success: true,
      source: "Google Sheets · Database Sarpras",
      generated_at: new Date().toISOString(),
      totals: {
        records: aset.length, aset: unit, ruangan: ruangan.length, nilai,
        baik, rusak_ringan: kondisi["Rusak Ringan"] || 0, rusak_berat: kondisi["Rusak Berat"] || 0,
        perlu_penanganan: perlu, belum_dinilai: belumDinilai, indeks_kesehatan: dinilai ? Math.round((baik / dinilai) * 1000) / 10 : null,
        tanpa_ruang: tanpaRuang
      },
      by_dana: sorted(dana), by_jenis: sorted(jenis), by_tahun: sorted(tahun).sort((a, b) => String(b.label).localeCompare(String(a.label))),
      by_ruang: sorted(ruang, 8),
      activity: log.slice(-5).reverse().map(l => ({ waktu: String(l.Waktu || ""), pengguna: String(l.Pengguna || ""), aktivitas: String(l.Aktivitas || ""), detail: String(l.Detail || "") }))
    });
  } catch (error) {
    return send(res, 503, { success: false, code: (error && error.message) || "sarpras_summary_unavailable", message: "Data aset tidak dapat dibaca. Periksa tab Aset, Ruangan, dan Log_Aktivitas pada spreadsheet." });
  }
}
module.exports = async function sarprasSheetAuth(req, res) {
  const c = config();
  const op = (req.query && req.query.op) || "";
  if (op === "summary" && req.method === "GET") return summary(req, res, c);
  if (op === "assets" && req.method === "GET") return assetsList(req, res, c);
  if (req.method === "GET") return verify(req, res, c);
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return send(res, 405, { success: false, code: "method_not_allowed", message: "Metode tidak diizinkan." });
  }
  const body = req.body && typeof req.body === "object" ? req.body : {};
  if (body.action === "logout") return send(res, 200, { success: true });
  if (body.action !== "login") return send(res, 400, { success: false, code: "invalid_action", message: "Operasi autentikasi tidak dikenal." });
  return login(req, res, c);
};
