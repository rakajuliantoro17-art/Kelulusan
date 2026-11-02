"use strict";

/**
 * PINTUKU HUMAS server API — Sprint 3B.
 * All Supabase service credentials remain server-side.
 * Supported operations: GET ?op=me and GET ?op=partners.
 */
const ALLOWED_PARTNER_ROLES = new Set([
  "staff_humas",
  "vice_principal_humas",
  "principal"
]);

function send(res, status, payload) {
  res.status(status).json(payload);
}

function setSecurityHeaders(res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
}

function readConfig() {
  const rawUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawUrl || !publishableKey || !serviceKey) return null;

  let url;
  try {
    url = new URL(rawUrl);
  } catch (_) {
    return null;
  }
  if (url.protocol !== "https:") return null;

  return {
    baseUrl: url.origin,
    publishableKey,
    serviceKey
  };
}

function readBearer(req) {
  const value = req.headers && req.headers.authorization;
  if (typeof value !== "string") return null;
  const match = value.match(/^Bearer\s+([^\s]+)$/i);
  return match ? match[1] : null;
}

async function fetchJson(url, options) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(10000)
  });
  let body = null;
  try {
    body = await response.json();
  } catch (_) {
    body = null;
  }
  return { response, body };
}

async function authenticate(baseUrl, publishableKey, accessToken) {
  const { response, body } = await fetchJson(
    baseUrl + "/auth/v1/user",
    {
      method: "GET",
      headers: {
        apikey: publishableKey,
        Authorization: "Bearer " + accessToken,
        Accept: "application/json"
      }
    }
  );

  if (response.status === 401 || response.status === 403) {
    return { ok: false, status: 401 };
  }
  if (!response.ok || !body || typeof body.id !== "string") {
    return { ok: false, status: 502 };
  }

  return {
    ok: true,
    user: {
      id: body.id,
      email: typeof body.email === "string" ? body.email : null,
      phone: typeof body.phone === "string" ? body.phone : null,
      created_at: body.created_at || null,
      last_sign_in_at: body.last_sign_in_at || null
    }
  };
}

async function loadRoles(baseUrl, serviceKey, userId) {
  const query = new URLSearchParams({
    select: "role_code",
    user_id: "eq." + userId,
    is_active: "eq.true",
    order: "assigned_at.asc"
  });

  const { response, body } = await fetchJson(
    baseUrl + "/rest/v1/user_roles?" + query.toString(),
    {
      method: "GET",
      headers: {
        apikey: serviceKey,
        Authorization: "Bearer " + serviceKey,
        "Accept-Profile": "humas",
        Accept: "application/json"
      }
    }
  );

  if (!response.ok || !Array.isArray(body)) {
    const error = new Error("HUMAS role store is unavailable.");
    error.code = "role_store_unavailable";
    error.upstreamStatus = response.status;
    throw error;
  }

  return [...new Set(body
    .map((row) => row && row.role_code)
    .filter((role) => [
      "staff_humas",
      "vice_principal_humas",
      "principal",
      "system_operator"
    ].includes(role)))];
}

async function loadPartners(baseUrl, serviceKey) {
  const query = new URLSearchParams({
    select: [
      "id", "partner_name", "partner_type", "institution_address",
      "contact_person", "contact_email", "contact_phone",
      "website_url", "record_status", "created_at", "updated_at"
    ].join(","),
    order: "created_at.desc",
    limit: "100"
  });

  const { response, body } = await fetchJson(
    baseUrl + "/rest/v1/partners?" + query.toString(),
    {
      method: "GET",
      headers: {
        apikey: serviceKey,
        Authorization: "Bearer " + serviceKey,
        "Accept-Profile": "humas",
        Accept: "application/json"
      }
    }
  );

  if (!response.ok || !Array.isArray(body)) {
    const error = new Error("HUMAS partner store is unavailable.");
    error.code = "partner_store_unavailable";
    error.upstreamStatus = response.status;
    throw error;
  }
  return body;
}

module.exports = async function humasApi(req, res) {
  setSecurityHeaders(res);

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return send(res, 405, {
      success: false,
      error: "method_not_allowed",
      message: "Metode permintaan tidak didukung."
    });
  }

  const config = readConfig();
  if (!config) {
    return send(res, 503, {
      success: false,
      error: "server_configuration_missing",
      message: "Layanan HUMAS belum dikonfigurasi pada server."
    });
  }

  const accessToken = readBearer(req);
  if (!accessToken) {
    return send(res, 401, {
      success: false,
      error: "authentication_required",
      message: "Silakan masuk untuk mengakses layanan HUMAS."
    });
  }

  try {
    const auth = await authenticate(
      config.baseUrl,
      config.publishableKey,
      accessToken
    );

    if (!auth.ok) {
      return send(res, auth.status, {
        success: false,
        error: auth.status === 401 ? "invalid_session" : "auth_service_unavailable",
        message: auth.status === 401
          ? "Sesi tidak valid atau telah berakhir."
          : "Layanan autentikasi sementara tidak tersedia."
      });
    }

    const roles = await loadRoles(
      config.baseUrl,
      config.serviceKey,
      auth.user.id
    );

    const op = String((req.query && req.query.op) || "me");

    if (op === "me") {
      return send(res, 200, {
        success: true,
        data: { user: auth.user, roles }
      });
    }

    if (op === "partners") {
      if (!roles.some((role) => ALLOWED_PARTNER_ROLES.has(role))) {
        return send(res, 403, {
          success: false,
          error: "insufficient_role",
          message: "Akun ini tidak memiliki kewenangan membaca direktori mitra."
        });
      }

      const partners = await loadPartners(config.baseUrl, config.serviceKey);
      return send(res, 200, {
        success: true,
        data: { partners, limit: 100 }
      });
    }

    return send(res, 404, {
      success: false,
      error: "operation_not_found",
      message: "Operasi HUMAS tidak ditemukan."
    });
  } catch (error) {
    // Do not log tokens, keys, user details, or upstream response bodies.
    console.error("[PINTUKU HUMAS API]", {
      code: error && error.code ? error.code : "upstream_error",
      status: error && error.upstreamStatus ? error.upstreamStatus : null
    });

    return send(res, 503, {
      success: false,
      error: error && error.code ? error.code : "upstream_unavailable",
      message: "Layanan data HUMAS belum siap atau sementara tidak tersedia."
    });
  }
};
