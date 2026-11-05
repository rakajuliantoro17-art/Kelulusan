"use strict";

/**
 * PINTUKU TU Core API.
 * TU identities and roles are sourced from the private spreadsheet; Supabase stores internal UUIDs only.
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
  if (!raw || !adminKey) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    return { baseUrl: url.origin, publishableKey: publishableKey || "", adminKey };
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
  let resolved;
  try { resolved = await require("../../TU/server/auth").resolveSession(token); }
  catch (_) { return { ok: false, status: 503 }; }
  if (!resolved) return { ok: false, status: 401 };

  const identityHeaders = adminHeaders(c);
  identityHeaders["Content-Profile"] = "tu";
  identityHeaders["Content-Type"] = "application/json";
  identityHeaders.Prefer = "resolution=merge-duplicates,return=representation";
  const identityResult = await request(c.baseUrl + "/rest/v1/identities?on_conflict=external_subject", {
    method: "POST", headers: identityHeaders,
    body: JSON.stringify({
      external_subject: resolved.user.username.toLowerCase(),
      display_name: resolved.user.nama,
      identity_type: "staff",
      identity_source: "spreadsheet",
      is_active: true,
      last_synced_at: new Date().toISOString()
    })
  });
  if (!identityResult.response.ok || !Array.isArray(identityResult.body) || !identityResult.body[0] ||
      typeof identityResult.body[0].id !== "string") return { ok: false, status: 503 };
  const identity = identityResult.body[0];

  const roleMap = { head_tu: "head_tu", staff_tu: "tu_operator", receptionist: "fo_receptionist",
    fo_coordinator: "fo_coordinator", unit_officer: "unit_officer", principal: "principal" };
  const roleCode = roleMap[resolved.role];
  if (!roleCode) return { ok: false, status: 403 };

  let unitId = null;
  if (roleCode === "unit_officer") {
    const unitCode = String(resolved.user.unit_code || "").trim().toLowerCase();
    if (!/^[a-z][a-z0-9_]{1,39}$/.test(unitCode)) return { ok: false, status: 403, code: "unit_assignment_required" };
    const unitResult = await request(c.baseUrl + "/rest/v1/units?select=id&unit_code=eq." +
      encodeURIComponent(unitCode) + "&is_active=eq.true", { headers: adminHeaders(c) });
    if (!unitResult.response.ok || !Array.isArray(unitResult.body)) return { ok: false, status: 503 };
    if (!unitResult.body[0]) return { ok: false, status: 403, code: "unit_assignment_invalid" };
    unitId = unitResult.body[0].id;
  }

  const currentRoles = await request(c.baseUrl + "/rest/v1/user_roles?select=id,role_code,unit_id,is_active,revoked_at&identity_id=eq." +
    encodeURIComponent(identity.id), { headers: adminHeaders(c) });
  if (!currentRoles.response.ok || !Array.isArray(currentRoles.body)) return { ok: false, status: 503 };
  const roleHeaders = adminHeaders(c);
  roleHeaders["Content-Profile"] = "tu";
  roleHeaders["Content-Type"] = "application/json";
  for (const row of currentRoles.body) {
    if (row.role_code !== roleCode || row.unit_id !== unitId) {
      const patch = await request(c.baseUrl + "/rest/v1/user_roles?id=eq." + encodeURIComponent(row.id), {
        method: "PATCH", headers: roleHeaders,
        body: JSON.stringify({ is_active: false, revoked_at: new Date().toISOString() })
      });
      if (!patch.response.ok) return { ok: false, status: 503 };
    }
  }
  const matching = currentRoles.body.find(row => row.role_code === roleCode && row.unit_id === unitId);
  if (matching) {
    if (!matching.is_active || matching.revoked_at) {
      const patch = await request(c.baseUrl + "/rest/v1/user_roles?id=eq." + encodeURIComponent(matching.id), {
        method: "PATCH", headers: roleHeaders,
        body: JSON.stringify({ is_active: true, revoked_at: null, notes: "Disinkronkan dari spreadsheet Pengguna." })
      });
      if (!patch.response.ok) return { ok: false, status: 503 };
    }
  } else {
    const inserted = await request(c.baseUrl + "/rest/v1/user_roles", {
      method: "POST", headers: { ...roleHeaders, Prefer: "return=representation" },
      body: JSON.stringify({ identity_id: identity.id, role_code: roleCode, unit_id: unitId,
        is_active: true, assigned_by_identity_id: null, notes: "Disinkronkan dari spreadsheet Pengguna." })
    });
    if (!inserted.response.ok) return { ok: false, status: 503 };
  }
  const roles = await activeRoles(c, identity.id);
  if (!requireRole(roles)) return { ok: false, status: 403 };
  return { ok: true, user: { id: identity.id, username: resolved.user.username, nama: resolved.user.nama }, roles };
}
async function activeRoles(c, userId) {
  const query = new URLSearchParams({
    select: "role_code,unit_id",
    identity_id: "eq." + userId,
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
  const clauses = ["recipient_identity_id.eq." + userId];
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
  const clauses = ["recipient_identity_id.eq." + userId];
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
    source: "receptionist", status: "pending_unit", created_by_identity_id: userId, updated_by_identity_id: userId
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
  const patch = { updated_by_identity_id: userId, status_note: note || null };
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
      nextStatus = "checked_in"; patch.checked_in_at = new Date().toISOString(); patch.checked_in_by_identity_id = userId;
    } else if (action === "checkout") {
      if (visit.status !== "checked_in") throw visitError("visit_transition_conflict");
      nextStatus = "completed"; patch.checked_out_at = new Date().toISOString(); patch.checked_out_by_identity_id = userId;
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
    if (!auth.ok) return send(res, auth.status, { success: false, code: auth.code || "unauthorized", message: auth.code === "unit_assignment_required" ? "Kolom UnitCode pada spreadsheet wajib diisi untuk Petugas Unit." : auth.code === "unit_assignment_invalid" ? "UnitCode akun tidak cocok dengan unit aktif di sistem TU." : "Sesi tidak valid atau layanan identitas TU tidak tersedia." });
    const roles = auth.roles;

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
