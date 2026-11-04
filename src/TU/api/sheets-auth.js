"use strict";

/**
 * TU Spreadsheet identity provider.
 * Source of truth: separate Google Spreadsheet, tab "Pengguna".
 * Columns: Username | Nama | Password | Status | Peran
 */
const crypto = require("crypto");

const INACTIVE = new Set(["tidak", "nonaktif", "non-aktif", "no", "n", "false", "0", "off"]);
const ACTIVE = new Set(["aktif", "active", "ya", "yes", "y", "true", "1", "on"]);
const ROLE_ALIASES = new Map([
  ["kepala tu", "head_tu"], ["kepala-tu", "head_tu"], ["kepala_tu", "head_tu"], ["head_tu", "head_tu"],
  ["kepala tata usaha", "head_tu"], ["kepala-tata-usaha", "head_tu"],
  ["koordinator front office", "fo_coordinator"], ["fo_coordinator", "fo_coordinator"],
  ["petugas front office", "fo_receptionist"], ["resepsionis", "fo_receptionist"], ["fo_receptionist", "fo_receptionist"],
  ["petugas unit", "unit_officer"], ["unit_officer", "unit_officer"],
  ["operator tu", "tu_operator"], ["tu_operator", "tu_operator"],
  ["kepala sekolah", "principal"], ["principal", "principal"]
]);

let cachedToken = null;
let cachedExpiry = 0;

function configError(message) {
  return Object.assign(new Error(message), { code: "tu_sheet_unavailable" });
}
function base64url(value) {
  return Buffer.from(value).toString("base64url");
}
async function googleAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedExpiry > now + 60) return cachedToken;

  const email = String(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "").trim();
  const privateKey = String(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "").replace(/\\n/g, "\n");
  if (!email || !privateKey) throw configError("Google Service Account belum dikonfigurasi.");
  const assertionBase = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" })) + "." +
    base64url(JSON.stringify({
      iss: email,
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600
    }));
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(assertionBase);
  signer.end();
  const assertion = assertionBase + "." + base64url(signer.sign(privateKey));
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    }),
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) {
    console.error("TU Google token request failed:", response.status);
    throw configError("Tidak dapat mengakses layanan Google.");
  }
  const data = await response.json();
  if (!data.access_token) throw configError("Google tidak mengembalikan token akses.");
  cachedToken = data.access_token;
  cachedExpiry = now + Number(data.expires_in || 3600);
  return cachedToken;
}
async function readUsers() {
  const sheetId = String(process.env.GOOGLE_SHEET_ID_TU || "").trim();
  if (!sheetId) throw configError("GOOGLE_SHEET_ID_TU belum diatur.");
  const token = await googleAccessToken();
  const range = encodeURIComponent("'Pengguna'!A:E");
  const response = await fetch(
    "https://sheets.googleapis.com/v4/spreadsheets/" + encodeURIComponent(sheetId) + "/values/" + range + "?valueRenderOption=FORMATTED_VALUE",
    { headers: { Authorization: "Bearer " + token }, signal: AbortSignal.timeout(10000) }
  );
  if (!response.ok) {
    console.error("TU Google Sheet read failed:", response.status);
    throw configError("Spreadsheet TU tidak dapat dibaca. Periksa ID, nama tab, dan akses Viewer Service Account.");
  }
  const data = await response.json();
  const rows = Array.isArray(data.values) ? data.values : [];
  if (!rows.length) return [];
  const header = rows[0].map(value => String(value || "").trim().toLowerCase());
  const expected = ["username", "nama", "password", "status", "peran"];
  if (expected.some((name, index) => header[index] !== name)) {
    throw configError('Header tab "Pengguna" harus berurutan: Username | Nama | Password | Status | Peran.');
  }
  return rows.slice(1).map(row => {
    const username = String(row[0] || "").trim().toLowerCase();
    const name = String(row[1] || "").trim();
    const password = String(row[2] || "").trim();
    const status = String(row[3] || "").trim().toLowerCase();
    const rawRole = String(row[4] || "").trim().toLowerCase().replace(/\s+/g, " ");
    const role = ROLE_ALIASES.get(rawRole) || null;
    const active = ACTIVE.has(status) && !INACTIVE.has(status);
    return { username, name, password, status, role, active };
  }).filter(user => user.username && user.name && user.password);
}
function constantTimeEqual(a, b) {
  const left = crypto.createHash("sha256").update(String(a)).digest();
  const right = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(left, right);
}
function verifyPassword(stored, given) {
  const value = String(stored || "");
  const password = String(given || "");
  // Preferred future format: scrypt$<salt-base64url>$<derived-key-base64url>
  const scrypt = /^scrypt\$([A-Za-z0-9_-]{16,})\$([A-Za-z0-9_-]{32,})$/.exec(value);
  if (scrypt) {
    const salt = Buffer.from(scrypt[1], "base64url");
    const expected = Buffer.from(scrypt[2], "base64url");
    if (salt.length < 12 || expected.length !== 64) return false;
    const actual = crypto.scryptSync(password, salt, expected.length);
    return crypto.timingSafeEqual(actual, expected);
  }
  const sha = /^sha256:([0-9a-f]{64})$/i.exec(value);
  if (sha) {
    const actual = crypto.createHash("sha256").update(password).digest();
    return crypto.timingSafeEqual(actual, Buffer.from(sha[1], "hex"));
  }
  // Legacy compatibility with existing school spreadsheet convention.
  return constantTimeEqual(password, value);
}
function stableIdentityId(username) {
  const bytes = crypto.createHash("sha256").update("pintuku-tu-identity:" + username).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20);
}
async function findActiveUser(username) {
  const normalized = String(username || "").trim().toLowerCase();
  const users = await readUsers();
  const user = users.find(item => item.username === normalized);
  if (!user || !user.active || !user.role) return null;
  return {
    id: stableIdentityId(user.username),
    username: user.username,
    email: user.username.includes("@") ? user.username : null,
    name: user.name,
    role_code: user.role
  };
}
async function authenticatePassword(username, password) {
  const normalized = String(username || "").trim().toLowerCase();
  const users = await readUsers();
  const user = users.find(item => item.username === normalized);
  if (!user || !user.active || !user.role || !verifyPassword(user.password, password)) return null;
  return {
    id: stableIdentityId(user.username),
    username: user.username,
    email: user.username.includes("@") ? user.username : null,
    name: user.name,
    role_code: user.role
  };
}
module.exports = { readUsers, findActiveUser, authenticatePassword, stableIdentityId };
