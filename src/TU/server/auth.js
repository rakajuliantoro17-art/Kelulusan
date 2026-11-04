"use strict";

/*
 * PINTUKU Tata Usaha — spreadsheet-backed authentication.
 * Reads only the private "Pengguna" tab using the Google service account.
 * Credentials never leave the server. Session tokens are HMAC-SHA256,
 * tab-scoped in the browser, and expire after 8 hours.
 *
 * Required environment:
 *   GOOGLE_SHEET_ID_TU
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL
 *   GOOGLE_SERVICE_ACCOUNT_KEY
 *   TU_SESSION_SECRET
 */
const crypto = require("crypto");

const TTL_SECONDS = 8 * 60 * 60;
const MAX_FAILS = 5;
const WINDOW_MS = 10 * 60 * 1000;
const failures = new Map();
let googleToken = { value: "", expiresAt: 0 };

const INACTIVE = new Set(["tidak", "nonaktif", "non-aktif", "no", "n", "false", "0", "off"]);
const ROLE_MAP = new Map([
  ["kepala tu", "head_tu"], ["head tu", "head_tu"],
  ["staf tu", "staff_tu"], ["staff tu", "staff_tu"],
  ["staf tata usaha", "staff_tu"], ["staff tata usaha", "staff_tu"],
  ["operator tu", "staff_tu"], ["tu operator", "staff_tu"],
  ["resepsionis", "receptionist"], ["receptionist", "receptionist"],
  ["petugas front office", "receptionist"], ["fo receptionist", "receptionist"],
  ["koordinator front office", "fo_coordinator"], ["fo coordinator", "fo_coordinator"],
  ["petugas unit", "unit_officer"], ["unit officer", "unit_officer"],
  ["kepala sekolah", "principal"], ["principal", "principal"]
]);

function send(res, status, body) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.status(status).json(body);
}
function config() {
  return {
    sheetId: String(process.env.GOOGLE_SHEET_ID_TU || "").trim(),
    email: String(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "").trim(),
    key: String(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "").replace(/\\n/g, "\n"),
    secret: String(process.env.TU_SESSION_SECRET || "")
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
  const range = encodeURIComponent("Pengguna!A:E");
  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets/" +
    encodeURIComponent(c.sheetId) + "/values/" + range + "?valueRenderOption=FORMATTED_VALUE", {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
      signal: AbortSignal.timeout(10000)
    });
  if (!response.ok) throw new Error("tu_user_sheet_unavailable");
  const data = await response.json();
  const values = Array.isArray(data.values) ? data.values : [];
  if (!values.length) throw new Error("tu_user_sheet_empty");
  const headers = values[0].map(value => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, ""));
  const index = {
    username: headers.indexOf("username"),
    nama: headers.indexOf("nama"),
    password: headers.indexOf("password"),
    status: headers.indexOf("status"),
    peran: headers.indexOf("peran")
  };
  if (Object.values(index).some(value => value < 0)) throw new Error("tu_user_sheet_headers_invalid");
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
      code: "tu_auth_not_configured",
      message: "Login TU belum dikonfigurasi. Administrator perlu memeriksa GOOGLE_SHEET_ID_TU, kredensial Service Account, dan TU_SESSION_SECRET."
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
        code: user && passOk ? "tu_role_unrecognized" : "authentication_failed",
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
    const message = known === "tu_user_sheet_headers_invalid" || known === "tu_user_sheet_empty"
      ? "Tab Pengguna belum memiliki header atau data akun dengan format yang sesuai."
      : "Data akun TU tidak dapat dibaca. Periksa akses Viewer Service Account pada spreadsheet.";
    return send(res, 503, { success: false, code: known || "tu_auth_unavailable", message });
  }
}
function verify(req, res, c) {
  if (!c.secret) return send(res, 503, { valid: false, code: "tu_auth_not_configured", message: "Verifikasi sesi TU belum dikonfigurasi." });
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
module.exports = async function tuSheetAuth(req, res) {
  const c = config();
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
