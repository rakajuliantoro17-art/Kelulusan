/* PINTUKU — gear pengaturan mengambang. Fokus pada preferensi antarmuka; navigasi ditangani dashboard dan side panel masing-masing modul. */
(() => {
  "use strict";
  if (window.__pintukuSettingsReady) return;
  window.__pintukuSettingsReady = true;

  const KEY = "pintuku-theme";
  const LANG_KEY = "pintuku-language";
  const root = document.documentElement;
  const systemLight = window.matchMedia("(prefers-color-scheme: light)");
  const read = () => { try { return localStorage.getItem(KEY); } catch (_) { return null; } };
  const isLight = () => root.dataset.theme === "light";
  const readLanguage = () => { try { return localStorage.getItem(LANG_KEY) === "en" ? "en" : "id"; } catch (_) { return "id"; } };
  function applyLanguage(language, persist) {
    const lang = language === "en" ? "en" : "id";
    root.lang = lang;
    document.body.dataset.language = lang;
    document.querySelectorAll("[data-pintuku-language]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.pintukuLanguage === lang));
    });
    if (persist) { try { localStorage.setItem(LANG_KEY, lang); } catch (_) {} }
    document.dispatchEvent(new CustomEvent("pintuku:languagechange", { detail: { language: lang } }));
  }

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

  function init() {
    if (document.getElementById("pintukuSettingsTrigger")) return;
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
          '<div class="ps-language"><div class="ps-row-text"><span class="ps-row-title">Bahasa / Language</span><span class="ps-row-desc">Pilih bahasa antarmuka</span></div><div class="ps-language-switch" role="group" aria-label="Pilih bahasa"><button type="button" data-pintuku-language="id" aria-pressed="true">ID</button><button type="button" data-pintuku-language="en" aria-pressed="false">EN</button></div></div>' +
          '<p class="ps-note">Bahasa antarmuka dapat diubah kapan saja. Dokumen resmi tetap mengikuti bahasa dokumen sumber.</p>' +
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
    drawer.querySelectorAll("[data-pintuku-language]").forEach((button) => button.addEventListener("click", () => applyLanguage(button.dataset.pintukuLanguage, true)));
    applyTheme(isLight() ? "light" : "dark");
    applyLanguage(readLanguage(), false);
  }

  const saved = read();
  applyTheme(saved === "light" || saved === "dark" ? saved : (systemLight.matches ? "light" : "dark"));
  applyLanguage(readLanguage(), false);
  systemLight.addEventListener && systemLight.addEventListener("change", (e) => {
    const pref = read();
    if (pref !== "light" && pref !== "dark") applyTheme(e.matches ? "light" : "dark");
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
