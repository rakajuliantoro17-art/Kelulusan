"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const {
  verifyPassword, normalizeRole, isActiveStatus, stableIdentityId
} = require("../api/sheets-auth");

test("TU roles are mapped through an explicit allowlist", () => {
  assert.equal(normalizeRole("Kepala TU"), "head_tu");
  assert.equal(normalizeRole(" kepala_tu "), "head_tu");
  assert.equal(normalizeRole("Kepala Tata Usaha"), "head_tu");
  assert.equal(normalizeRole("administrator bebas"), null);
  assert.equal(normalizeRole("Petugas Unit"), null);
});

test("TU status must be explicitly active", () => {
  assert.equal(isActiveStatus("Aktif"), true);
  assert.equal(isActiveStatus("TRUE"), true);
  assert.equal(isActiveStatus("Nonaktif"), false);
  assert.equal(isActiveStatus(""), false);
  assert.equal(isActiveStatus("status-lain"), false);
});

test("password verifier supports scrypt, sha256 compatibility, and legacy plaintext", () => {
  const password = "contoh-password-uji";
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64);
  const scryptValue = "scrypt$" + salt.toString("base64url") + "$" + derived.toString("base64url");
  const shaValue = "sha256:" + crypto.createHash("sha256").update(password).digest("hex");

  assert.equal(verifyPassword(scryptValue, password), true);
  assert.equal(verifyPassword(shaValue, password), true);
  assert.equal(verifyPassword(password, password), true);
  assert.equal(verifyPassword(scryptValue, "salah"), false);
  assert.equal(verifyPassword(shaValue, "salah"), false);
});

test("TU identity UUID is deterministic and valid", () => {
  const first = stableIdentityId("kepala.tu@example.test");
  assert.equal(first, stableIdentityId("kepala.tu@example.test"));
  assert.match(first, /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});
