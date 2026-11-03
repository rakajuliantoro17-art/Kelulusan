"use strict";

/**
 * PINTUKU TU Core API.
 * All TU schema access is server-side through the Supabase service credential.
 * Browser clients must never receive the service credential or direct schema grants.
 */
const ALLOWED_ROLES = new Set([
  "principal", "head_tu", "fo_coordinator", "fo_receptionist",
  "unit_officer", "tu_operator", "teacher", "homeroom_teacher", "system_operator"
]);

function send(res, status, payload) {
  return res.status(status).json(payload);
}
function setHeaders(res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
}
function config() {
  const raw = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const adminKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!raw || !publishableKey || !adminKey) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    return { baseUrl: url.origin, publishableKey, adminKey };
  } catch (_) {
    return null;
  }
}
function bearer(req) {
  const value = req.headers && req.headers.authorization;
  const match = typeof value === "string" ? value.match(/^Bearer\s+([^\s]+)$/i) : null;
  return match ? match[1] : null;
}
async function request(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
  let body = null;
  try { body = await response.json(); } catch (_) {}
  return { response, body };
}
function adminHeaders(c, schema = true) {
  const headers = { apikey: c.adminKey, Accept: "application/json" };
  if (schema) headers["Accept-Profile"] = "tu";
  if (!c.adminKey.startsWith("sb_secret_")) headers.Authorization = "Bearer " + c.adminKey;
  return headers;
}
async function authenticate(c, token) {
  const result = await request(c.baseUrl + "/auth/v1/user", {
    headers: {
      apikey: c.publishableKey,
      Authorization: "Bearer " + token,
      Accept: "application/json"
    }
  });
  if (result.response.status === 401 || result.response.status === 403) return { ok: false, status: 401 };
  if (!result.response.ok || !result.body || typeof result.body.id !== "string") return { ok: false, status: 502 };
  return { ok: true, user: { id: result.body.id, email: typeof result.body.email === "string" ? result.body.email : null } };
}
async function activeRoles(c, userId) {
  const query = new URLSearchParams({
    select: "role_code,unit_id",
    user_id: "eq." + userId,
    is_active: "eq.true",
    revoked_at: "is.null",
    order: "assigned_at.asc"
  });
  const result = await request(c.baseUrl + "/rest/v1/user_roles?" + query, {
    headers: adminHeaders(c)
  });
  if (!result.response.ok || !Array.isArray(result.body)) {
    throw Object.assign(new Error("role_store_unavailable"), { code: "role_store_unavailable" });
  }
  return result.body.filter(row => row && ALLOWED_ROLES.has(row.role_code) &&
    (row.unit_id === null || /^[0-9a-f-]{36}$/i.test(row.unit_id)));
}
const TU_ACCESS_ROLES = new Set([
  "principal", "head_tu", "fo_coordinator", "fo_receptionist", "unit_officer", "tu_operator"
]);
function requireRole(roles) {
  // Only explicit TU business roles may enter this workspace; teacher roles and technical operators are insufficient.
  return Array.isArray(roles) && roles.some(role => TU_ACCESS_ROLES.has(role.role_code));
}
async function listUnits(c) {
  const query = new URLSearchParams({
    select: "id,unit_code,unit_name,unit_type,parent_unit_id,sort_order",
    is_active: "eq.true",
    order: "sort_order.asc,unit_name.asc"
  });
  const result = await request(c.baseUrl + "/rest/v1/units?" + query, { headers: adminHeaders(c) });
  if (!result.response.ok || !Array.isArray(result.body)) {
    throw Object.assign(new Error("data_store_unavailable"), { code: "data_store_unavailable" });
  }
  return result.body;
}
async function listNotifications(c, userId, unitIds) {
  const query = new URLSearchParams({
    select: "id,notification_type,title,body,target_path,entity_type,entity_id,priority,read_at,acted_at,created_at,expires_at,recipient_unit_id",
    order: "created_at.desc",
    limit: "50"
  });
  const clauses = ["recipient_user_id.eq." + userId];
  if (unitIds.length) clauses.push("recipient_unit_id.in.(" + unitIds.join(",") + ")");
  query.set("or", "(" + clauses.join(",") + ")");
  const result = await request(c.baseUrl + "/rest/v1/visit_notifications?" + query, {
    headers: adminHeaders(c)
  });
  if (!result.response.ok || !Array.isArray(result.body)) {
    throw Object.assign(new Error("data_store_unavailable"), { code: "data_store_unavailable" });
  }
  return result.body;
}
async function markNotificationRead(c, userId, unitIds, notificationId) {
  if (typeof notificationId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(notificationId)) {
    throw Object.assign(new Error("invalid_request"), { code: "invalid_request" });
  }
  const query = new URLSearchParams({ id: "eq." + notificationId });
  const clauses = ["recipient_user_id.eq." + userId];
  if (unitIds.length) clauses.push("recipient_unit_id.in.(" + unitIds.join(",") + ")");
  query.set("or", "(" + clauses.join(",") + ")");
  const headers = adminHeaders(c);
  headers["Content-Profile"] = "tu";
  headers["Content-Type"] = "application/json";
  headers.Prefer = "return=representation";
  const result = await request(c.baseUrl + "/rest/v1/visit_notifications?" + query, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ read_at: new Date().toISOString() })
  });
  if (!result.response.ok || !Array.isArray(result.body)) {
    throw Object.assign(new Error("data_store_unavailable"), { code: "data_store_unavailable" });
  }
  return result.body.length > 0;
}
async function supabaseAuth(c, path, payload, accessToken) {
  const headers = {
    apikey: c.publishableKey,
    "Content-Type": "application/json",
    Accept: "application/json"
  };
  if (accessToken) headers.Authorization = "Bearer " + accessToken;
  return request(c.baseUrl + "/auth/v1/" + path, {
    method: "POST",
    headers,
    body: JSON.stringify(payload || {})
  });
}
function safeSession(body) {
  if (!body || typeof body.access_token !== "string" ||
      typeof body.refresh_token !== "string" ||
      !Number.isFinite(Number(body.expires_in))) return null;
  return {
    access_token: body.access_token,
    refresh_token: body.refresh_token,
    token_type: "bearer",
    expires_in: Number(body.expires_in),
    expires_at: Number(body.expires_at) || Math.floor(Date.now() / 1000) + Number(body.expires_in),
    user: body.user && typeof body.user.id === "string"
      ? { id: body.user.id, email: typeof body.user.email === "string" ? body.user.email : null }
      : null
  };
}
async function authOperation(c, req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return send(res, 405, { success: false, code: "method_not_allowed", message: "Metode tidak diizinkan." });
  }
  const body = bodyOf(req);
  const action = String(body.action || "");
  let result;
  if (action === "login") {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        password.length < 1 || password.length > 256) {
      return send(res, 400, { success: false, code: "invalid_credentials_format", message: "Email atau kata sandi tidak valid." });
    }
    result = await supabaseAuth(c, "token?grant_type=password", { email, password });
  } else if (action === "refresh") {
    const refreshToken = typeof body.refresh_token === "string" ? body.refresh_token : "";
    if (!refreshToken || refreshToken.length > 4096) {
      return send(res, 400, { success: false, code: "invalid_refresh_token", message: "Sesi perlu diperbarui. Silakan masuk kembali." });
    }
    result = await supabaseAuth(c, "token?grant_type=refresh_token", { refresh_token: refreshToken });
  } else if (action === "logout") {
    const accessToken = bearer(req);
    if (accessToken) await supabaseAuth(c, "logout", {}, accessToken);
    return send(res, 200, { success: true });
  } else {
    return send(res, 400, { success: false, code: "invalid_action", message: "Operasi autentikasi tidak dikenal." });
  }
  if (result.response.status === 400 || result.response.status === 401 || result.response.status === 422) {
    return send(res, 401, { success: false, code: "authentication_failed", message: "Email atau kata sandi salah, atau sesi telah berakhir." });
  }
  if (!result.response.ok) {
    return send(res, 503, { success: false, code: "auth_unavailable", message: "Layanan autentikasi sedang tidak tersedia." });
  }
  const session = safeSession(result.body);
  if (!session || !session.user) return send(res, 502, { success: false, code: "invalid_auth_response", message: "Respons autentikasi tidak dapat diverifikasi." });
  const roles = await activeRoles(c, session.user.id);
  if (!requireRole(roles)) {
    return send(res, 403, { success: false, code: "insufficient_role", message: "Akun berhasil dikenali, tetapi belum memiliki peran Tata Usaha yang aktif. Hubungi Kepala TU atau administrator yang berwenang." });
  }
  return send(res, 200, { success: true, session, roles: roles.map(role => ({ role_code: role.role_code, unit_id: role.unit_id })) });
}
function bodyOf(req) {
  return req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
}
function safeError(res, error) {
  const errors = {
    invalid_request: [400, "invalid_request", "Permintaan tidak valid."],
    role_store_unavailable: [503, "role_store_unavailable", "Layanan otorisasi TU belum tersedia."],
    data_store_unavailable: [503, "data_store_unavailable", "Layanan data TU sementara tidak tersedia."]
  };
  const item = errors[error && error.code] || [500, "internal_error", "Layanan TU mengalami kendala."];
  return send(res, item[0], { success: false, code: item[1], message: item[2] });
}

module.exports = async function tuApi(req, res) {
  setHeaders(res);
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, POST, PATCH, OPTIONS");
    return res.status(204).end();
  }
  const c = config();
  if (!c) return send(res, 503, { success: false, code: "service_unavailable", message: "Konfigurasi layanan TU belum lengkap." });
  const op = String((req.query && req.query.op) || "");
  if (op === "auth") {
    try { return await authOperation(c, req, res); }
    catch (error) { return safeError(res, error); }
  }
  const token = bearer(req);
  if (!token) return send(res, 401, { success: false, code: "unauthorized", message: "Silakan masuk melalui akun Tata Usaha." });

  try {
    const auth = await authenticate(c, token);
    if (!auth.ok) return send(res, auth.status, { success: false, code: "unauthorized", message: "Sesi tidak valid atau layanan autentikasi tidak tersedia." });
    const roles = await activeRoles(c, auth.user.id);
    if (!requireRole(roles)) return send(res, 403, { success: false, code: "insufficient_role", message: "Akun belum memiliki peran Tata Usaha." });

    if (op === "context" && req.method === "GET") {
      const units = await listUnits(c);
      const unitIds = [...new Set(roles.map(role => role.unit_id).filter(Boolean))];
      return send(res, 200, {
        success: true,
        user: auth.user,
        roles: roles.map(role => ({ role_code: role.role_code, unit_id: role.unit_id })),
        assigned_units: units.filter(unit => unitIds.includes(unit.id)),
        units
      });
    }
    if (op === "units" && req.method === "GET") {
      return send(res, 200, { success: true, units: await listUnits(c) });
    }
    const unitIds = [...new Set(roles.map(role => role.unit_id).filter(Boolean))];
    if (op === "notifications" && req.method === "GET") {
      const notifications = await listNotifications(c, auth.user.id, unitIds);
      return send(res, 200, {
        success: true,
        notifications,
        unread_count: notifications.filter(item => !item.read_at).length
      });
    }
    if (op === "notification-read" && req.method === "PATCH") {
      const changed = await markNotificationRead(c, auth.user.id, unitIds, bodyOf(req).id);
      if (!changed) return send(res, 404, { success: false, code: "record_not_found", message: "Notifikasi tidak ditemukan atau bukan untuk akun/unit Anda." });
      return send(res, 200, { success: true });
    }
    res.setHeader("Allow", "GET, PATCH, OPTIONS");
    return send(res, 404, { success: false, code: "not_found", message: "Operasi TU tidak ditemukan." });
  } catch (error) {
    return safeError(res, error);
  }
};
