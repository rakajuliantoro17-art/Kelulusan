/* PINTUKU — gear pengaturan mengambang (tema + pintasan modul). Dipakai semua halaman portal. */
(() => {
  "use strict";
  if (window.__pintukuSettingsReady) return;
  window.__pintukuSettingsReady = true;

  // Daftar modul untuk pintasan di panel. Modul baru (Humas, TU, Operasional): tambah satu baris di sini
  // dan satu kartu <article class="module-card"> di dashboard/index.html.
  const MODULES = [
    { id: "akademik", label: "Akademik", href: "/akademik/dashboard" },
    { id: "sarpras", label: "Sarana & Prasarana", href: "/sarpras/" },
    { id: "kesiswaan", label: "Kesiswaan", href: "/kesiswaan/" },
    { id: "humas", label: "Hubungan Masyarakat", href: "/humas" },
    { id: "tata-usaha", label: "Tata Usaha", href: "/tata-usaha" }
  ];

  const KEY = "pintuku-theme";
  const root = document.documentElement;
  const systemLight = window.matchMedia("(prefers-color-scheme: light)");
  const read = () => { try { return localStorage.getItem(KEY); } catch (_) { return null; } };
  const isLight = () => root.dataset.theme === "light";

  function applyTheme(theme, persist) {
    const light = theme === "light";
    root.dataset.theme = light ? "light" : "dark";
    root.style.colorScheme = light ? "light" : "dark";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", light ? "#edf3fa" : "#050c18");
    const toggle = document.getElementById("pintukuThemeToggle");
    if (toggle) toggle.setAttribute("aria-pressed", String(!light));
    if (persist) { try { localStorage.setItem(KEY, theme); } catch (_) {} }
  }

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

  function init() {
    if (document.getElementById("pintukuSettingsTrigger")) return;
    const current = document.body.dataset.portalModule || "home";
    const links = [{ id: "home", label: "Beranda", href: "/" }].concat(MODULES).map((m) =>
      '<li><a class="ps-link" href="' + m.href + '"' + (m.id === current ? ' aria-current="page"' : "") + '><span>' +
      esc(m.label) + '</span><span aria-hidden="true">→</span></a></li>').join("");

    const wrap = document.createElement("div");
    wrap.innerHTML =
      '<button class="ps-trigger" id="pintukuSettingsTrigger" type="button" aria-label="Buka panel pengaturan" aria-haspopup="dialog" aria-expanded="false">' +
        '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"></path></svg>' +
      '</button>' +
      '<div class="ps-overlay" id="pintukuSettingsOverlay"></div>' +
      '<aside class="ps-drawer" id="pintukuSettingsDrawer" role="dialog" aria-modal="true" aria-label="Panel pengaturan" aria-hidden="true">' +
        '<div class="ps-head"><div><strong>Pengaturan</strong><small>PINTUKU · SMAN 1 Sooko</small></div>' +
        '<button class="ps-close" id="pintukuSettingsClose" type="button" aria-label="Tutup panel">&times;</button></div>' +
        '<div class="ps-body">' +
          '<div class="ps-row"><div class="ps-row-text"><span class="ps-row-title">Mode tampilan</span><span class="ps-row-desc">Beralih antara terang dan gelap</span></div>' +
          '<button class="ps-toggle" id="pintukuThemeToggle" type="button" aria-label="Ganti mode gelap atau terang" aria-pressed="false">' +
          '<span class="ps-toggle-track"><span aria-hidden="true">☀️</span><span aria-hidden="true">🌙</span></span><span class="ps-toggle-thumb"></span></button></div>' +
          '<p class="ps-note">Pilihan tema disimpan di perangkat ini dan berlaku di seluruh halaman portal.</p>' +
          '<h2 class="ps-sub">Pintasan</h2><ul class="ps-links">' + links + '</ul>' +
        '</div></aside>';
    while (wrap.firstElementChild) document.body.appendChild(wrap.firstElementChild);

    const trigger = document.getElementById("pintukuSettingsTrigger");
    const overlay = document.getElementById("pintukuSettingsOverlay");
    const drawer = document.getElementById("pintukuSettingsDrawer");
    const set = (open) => {
      drawer.classList.toggle("open", open);
      overlay.classList.toggle("open", open);
      drawer.setAttribute("aria-hidden", String(!open));
      trigger.setAttribute("aria-expanded", String(open));
      if (open) document.getElementById("pintukuSettingsClose").focus(); else trigger.focus({ preventScroll: true });
    };
    trigger.addEventListener("click", () => set(!drawer.classList.contains("open")));
    overlay.addEventListener("click", () => set(false));
    document.getElementById("pintukuSettingsClose").addEventListener("click", () => set(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("open")) set(false); });
    document.getElementById("pintukuThemeToggle").addEventListener("click", () => applyTheme(isLight() ? "dark" : "light", true));
    applyTheme(isLight() ? "light" : "dark");
  }

  const saved = read();
  applyTheme(saved === "light" || saved === "dark" ? saved : (systemLight.matches ? "light" : "dark"));
  systemLight.addEventListener && systemLight.addEventListener("change", (e) => {
    const pref = read();
    if (pref !== "light" && pref !== "dark") applyTheme(e.matches ? "light" : "dark");
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
