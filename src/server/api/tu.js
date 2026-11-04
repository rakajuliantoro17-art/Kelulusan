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

const FRONT_OFFICE_ROLES = new Set(["principal","head_tu","fo_coordinator","fo_receptionist","tu_operator"]);
const UNIT_APPROVER_ROLES = new Set(["unit_officer","head_tu","principal"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function hasFrontOfficeRole(roles) {
  return roles.some(role => FRONT_OFFICE_ROLES.has(role.role_code));
}
function visitError(code) {
  return Object.assign(new Error(code), { code });
}
function safeVisit(row, canSeeContact) {
  if (!row) return row;
  const copy = { ...row };
  if (!canSeeContact) delete copy.contact_phone;
  return copy;
}
async function listVisits(c, roles, queryInput) {
  const query = new URLSearchParams({
    select: "id,visit_code,visitor_name,organization,contact_phone,purpose,destination_unit_id,host_name,notes,status_note,visit_kind,scheduled_at,source,status,checked_in_at,checked_out_at,created_at,updated_at,destination_unit:units!visits_destination_unit_id_fkey(unit_code,unit_name)",
    order: "created_at.desc",
    limit: "100"
  });
  const status = typeof queryInput.status === "string" ? queryInput.status : "";
  const allowedStatus = new Set(["pending_unit","approved","clarification_requested","rejected","checked_in","completed","cancelled"]);
  if (status && allowedStatus.has(status)) query.set("status", "eq." + status);
  const q = typeof queryInput.q === "string" ? queryInput.q.trim().replace(/[%,()_*]/g, " ").slice(0, 60) : "";
  if (q.length >= 2) {
    const pattern = "*" + q + "*";
    query.set("or", "(visitor_name.ilike." + pattern + ",organization.ilike." + pattern + ",visit_code.ilike." + pattern + ")");
  }
  const canSeeAll = hasFrontOfficeRole(roles);
  if (!canSeeAll) {
    const unitIds = [...new Set(roles.filter(role => role.role_code === "unit_officer" && role.unit_id).map(role => role.unit_id))];
    if (!unitIds.length) throw visitError("visit_forbidden");
    query.set("destination_unit_id", "in.(" + unitIds.join(",") + ")");
  }
  const result = await request(c.baseUrl + "/rest/v1/visits?" + query, { headers: adminHeaders(c) });
  if (!result.response.ok || !Array.isArray(result.body)) throw visitError("visit_store_unavailable");
  return result.body.map(row => safeVisit(row, canSeeAll));
}
async function createVisit(c, userId, body) {
  const visitorName = typeof body.visitor_name === "string" ? body.visitor_name.trim() : "";
  const organization = typeof body.organization === "string" ? body.organization.trim() : "";
  const phone = typeof body.contact_phone === "string" ? body.contact_phone.trim() : "";
  const purpose = typeof body.purpose === "string" ? body.purpose.trim() : "";
  const unitId = typeof body.destination_unit_id === "string" ? body.destination_unit_id : "";
  const host = typeof body.host_name === "string" ? body.host_name.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  if (body.visit_kind !== undefined && !["walk_in","appointment"].includes(body.visit_kind)) throw visitError("invalid_visit_input");
  const kind = body.visit_kind === "appointment" ? "appointment" : "walk_in";
  const scheduledAt = typeof body.scheduled_at === "string" ? body.scheduled_at : null;
  if (visitorName.length < 2 || visitorName.length > 100 || purpose.length < 2 || purpose.length > 160 ||
      organization.length > 120 || phone.length > 25 || (phone && !/^[+0-9 ()-]{6,25}$/.test(phone)) ||
      host.length > 100 || notes.length > 1000 || !UUID_RE.test(unitId)) {
    throw visitError("invalid_visit_input");
  }
  if (body.privacy_notice_delivered !== true) throw visitError("privacy_notice_required");
  if (kind === "appointment" && (!scheduledAt || !Number.isFinite(Date.parse(scheduledAt)) || Date.parse(scheduledAt) < Date.now() - 300000)) {
    throw visitError("invalid_appointment_time");
  }
  const unitCheck = await request(c.baseUrl + "/rest/v1/units?select=id&is_active=eq.true&id=eq." + unitId, { headers: adminHeaders(c) });
  if (!unitCheck.response.ok || !Array.isArray(unitCheck.body)) throw visitError("visit_store_unavailable");
  if (!unitCheck.body.length) throw visitError("invalid_destination_unit");
  const date = new Date();
  const day = date.toISOString().slice(0,10).replace(/-/g,"");
  const code = "FO-" + day + "-" + require("crypto").randomBytes(3).toString("hex").toUpperCase();
  const payload = {
    visit_code: code, visitor_name: visitorName, organization: organization || null,
    contact_phone: phone || null, purpose, destination_unit_id: unitId,
    host_name: host || null, notes: notes || null, visit_kind: kind,
    scheduled_at: kind === "appointment" ? new Date(scheduledAt).toISOString() : null,
    privacy_notice_delivered: true, privacy_notice_delivered_at: new Date().toISOString(),
    source: "receptionist", status: "pending_unit", created_by: userId, updated_by: userId
  };
  const headers = adminHeaders(c);
  headers["Content-Profile"] = "tu";
  headers["Content-Type"] = "application/json";
  headers.Prefer = "return=representation";
  const result = await request(c.baseUrl + "/rest/v1/visits", {
    method: "POST", headers, body: JSON.stringify(payload)
  });
  if (result.response.status === 409) throw visitError("visit_code_conflict");
  if (!result.response.ok || !Array.isArray(result.body) || !result.body[0]) throw visitError("visit_store_unavailable");
  return result.body[0];
}
async function getVisit(c, id) {
  if (typeof id !== "string" || !UUID_RE.test(id)) throw visitError("invalid_visit_id");
  const query = new URLSearchParams({ select: "*", id: "eq." + id, limit: "1" });
  const result = await request(c.baseUrl + "/rest/v1/visits?" + query, { headers: adminHeaders(c) });
  if (!result.response.ok || !Array.isArray(result.body)) throw visitError("visit_store_unavailable");
  return result.body[0] || null;
}
async function transitionVisit(c, userId, roles, body) {
  const id = body.id;
  const action = typeof body.action === "string" ? body.action : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";
  if (note.length > 500) throw visitError("invalid_visit_input");
  const visit = await getVisit(c, id);
  if (!visit) return null;
  const canSeeAll = hasFrontOfficeRole(roles);
  const assignedApprover = roles.some(role => role.role_code === "unit_officer" && role.unit_id === visit.destination_unit_id);
  const supervisor = roles.some(role => UNIT_APPROVER_ROLES.has(role.role_code) && role.role_code !== "unit_officer");
  const isApprover = assignedApprover || supervisor;
  const isFrontOffice = canSeeAll;
  let nextStatus = "";
  const patch = { updated_by: userId, status_note: note || null };
  if (["approve","reject","clarify"].includes(action)) {
    if (!isApprover) throw visitError("visit_forbidden");
    if (visit.status !== "pending_unit") throw visitError("visit_transition_conflict");
    if (action === "reject" && note.length < 3) throw visitError("visit_note_required");
    if (action === "clarify" && note.length < 3) throw visitError("visit_note_required");
    nextStatus = action === "approve" ? "approved" : action === "reject" ? "rejected" : "clarification_requested";
  } else if (["checkin","checkout","cancel","resubmit"].includes(action)) {
    if (!isFrontOffice) throw visitError("visit_forbidden");
    if (action === "checkin") {
      if (visit.status !== "approved") throw visitError("visit_transition_conflict");
      nextStatus = "checked_in"; patch.checked_in_at = new Date().toISOString(); patch.checked_in_by = userId;
    } else if (action === "checkout") {
      if (visit.status !== "checked_in") throw visitError("visit_transition_conflict");
      nextStatus = "completed"; patch.checked_out_at = new Date().toISOString(); patch.checked_out_by = userId;
    } else if (action === "cancel") {
      if (!["pending_unit","approved","clarification_requested"].includes(visit.status)) throw visitError("visit_transition_conflict");
      nextStatus = "cancelled";
    } else {
      if (visit.status !== "clarification_requested" || note.length < 3) throw visitError("visit_note_required");
      nextStatus = "pending_unit";
    }
  } else {
    throw visitError("invalid_visit_action");
  }
  patch.status = nextStatus;
  const query = new URLSearchParams({ id: "eq." + id, status: "eq." + visit.status });
  const headers = adminHeaders(c);
  headers["Content-Profile"] = "tu";
  headers["Content-Type"] = "application/json";
  headers.Prefer = "return=representation";
  const result = await request(c.baseUrl + "/rest/v1/visits?" + query, {
    method: "PATCH", headers, body: JSON.stringify(patch)
  });
  if (!result.response.ok || !Array.isArray(result.body)) throw visitError("visit_store_unavailable");
  if (!result.body.length) throw visitError("visit_transition_conflict");
  return safeVisit(result.body[0], canSeeAll);
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
  } else if (action === "verify-invite") {
    const tokenHash = typeof body.token_hash === "string" ? body.token_hash.trim() : "";
    if (tokenHash.length < 20 || tokenHash.length > 512 || !/^[A-Za-z0-9._~-]+$/.test(tokenHash)) {
      return send(res, 400, { success: false, code: "invalid_invite_token", message: "Tautan undangan tidak valid. Minta administrator mengirim undangan baru." });
    }
    result = await supabaseAuth(c, "verify", { token_hash: tokenHash, type: "invite" });
    if (result.response.status === 400 || result.response.status === 401 || result.response.status === 422) {
      return send(res, 410, { success: false, code: "invite_expired", message: "Tautan undangan sudah kedaluwarsa atau pernah digunakan. Minta undangan baru kepada administrator." });
    }
    if (!result.response.ok) return send(res, 503, { success: false, code: "auth_unavailable", message: "Layanan verifikasi undangan sedang tidak tersedia." });
    const inviteSession = safeSession(result.body);
    if (!inviteSession || !inviteSession.user) return send(res, 502, { success: false, code: "invalid_auth_response", message: "Respons verifikasi undangan tidak dapat diverifikasi." });
    return send(res, 200, { success: true, access_token: inviteSession.access_token, email: inviteSession.user.email });
  } else if (action === "set-invite-password") {
    const accessToken = typeof body.access_token === "string" ? body.access_token : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!accessToken || accessToken.length > 8192 || password.length < 12 || password.length > 256) {
      return send(res, 400, { success: false, code: "invalid_password_input", message: "Kata sandi harus terdiri dari 12–256 karakter." });
    }
    const identity = await authenticate(c, accessToken);
    if (!identity.ok) return send(res, 401, { success: false, code: "invite_session_invalid", message: "Sesi undangan tidak valid. Buka kembali tautan undangan." });
    const update = await request(c.baseUrl + "/auth/v1/user", {
      method: "PUT",
      headers: { apikey: c.publishableKey, Authorization: "Bearer " + accessToken, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ password })
    });
    if (update.response.status === 400 || update.response.status === 422) {
      return send(res, 400, { success: false, code: "password_rejected", message: "Kata sandi ditolak. Gunakan kata sandi yang lebih kuat dan coba kembali." });
    }
    if (!update.response.ok || !update.body || typeof update.body.id !== "string") {
      return send(res, 503, { success: false, code: "password_update_failed", message: "Kata sandi belum berhasil disimpan. Coba kembali melalui tautan undangan yang masih aktif." });
    }
    await supabaseAuth(c, "logout", {}, accessToken);
    return send(res, 200, { success: true, message: "Kata sandi berhasil dibuat. Silakan masuk melalui halaman login Tata Usaha." });
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
    data_store_unavailable: [503, "data_store_unavailable", "Layanan data TU sementara tidak tersedia."],
    visit_store_unavailable: [503, "visit_store_unavailable", "Layanan kunjungan sementara tidak tersedia."],
    visit_forbidden: [403, "visit_forbidden", "Akun tidak memiliki kewenangan untuk operasi kunjungan ini."],
    invalid_visit_input: [400, "invalid_visit_input", "Periksa kembali data kunjungan yang dimasukkan."],
    privacy_notice_required: [400, "privacy_notice_required", "Konfirmasi bahwa pemberitahuan privasi telah disampaikan kepada pengunjung wajib dilakukan."],
    invalid_appointment_time: [400, "invalid_appointment_time", "Waktu janji temu harus valid dan tidak berada di masa lalu."],
    invalid_destination_unit: [400, "invalid_destination_unit", "Unit tujuan tidak ditemukan atau tidak aktif."],
    invalid_visit_id: [400, "invalid_visit_id", "ID kunjungan tidak valid."],
    invalid_visit_action: [400, "invalid_visit_action", "Operasi status kunjungan tidak dikenal."],
    visit_note_required: [400, "visit_note_required", "Catatan wajib diisi untuk tindakan ini."],
    visit_transition_conflict: [409, "visit_transition_conflict", "Status kunjungan telah berubah atau tindakan tidak sesuai alur."],
    visit_code_conflict: [409, "visit_code_conflict", "Nomor kunjungan bentrok. Silakan ulangi registrasi."]
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
  const op = String((req.query && req.query.op) || "");
  // Login workspace memakai akun pada Google Spreadsheet TU, tidak memakai Supabase Auth.
  if (op === "auth") {
    try { return await require("../../TU/server/auth")(req, res); }
    catch (error) {
      console.error("TU spreadsheet auth error:", error && error.message);
      return send(res, 503, { success: false, valid: false, code: "tu_auth_unavailable", message: "Layanan login Tata Usaha sementara tidak tersedia." });
    }
  }
  const c = config();
  if (!c) return send(res, 503, { success: false, code: "service_unavailable", message: "Konfigurasi layanan operasional TU belum lengkap." });
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
    if (op === "visits" && req.method === "GET") {
      const visits = await listVisits(c, roles, (req.query || {}));
      return send(res, 200, { success: true, visits, count: visits.length });
    }
    if (op === "visits" && req.method === "POST") {
      if (!hasFrontOfficeRole(roles)) return send(res, 403, { success: false, code: "visit_forbidden", message: "Registrasi kunjungan hanya dapat dilakukan petugas Front Office." });
      const visit = await createVisit(c, auth.user.id, bodyOf(req));
      return send(res, 201, { success: true, visit });
    }
    if (op === "visits" && req.method === "PATCH") {
      const visit = await transitionVisit(c, auth.user.id, roles, bodyOf(req));
      if (!visit) return send(res, 404, { success: false, code: "record_not_found", message: "Kunjungan tidak ditemukan." });
      return send(res, 200, { success: true, visit });
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
    res.setHeader("Allow", "GET, POST, PATCH, OPTIONS");
    return send(res, 404, { success: false, code: "not_found", message: "Operasi TU tidak ditemukan." });
  } catch (error) {
    return safeError(res, error);
  }
};
