(() => {
  "use strict";

  const year = document.querySelector("[data-current-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  document.querySelectorAll("[data-scroll]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || !targetId.startsWith("#")) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start"
      });
    });
  });

  document.querySelectorAll("[data-module-pending]").forEach((button) => {
    button.addEventListener("click", () => {
      const label = button.getAttribute("data-module-pending") || "Modul";
      const status = document.getElementById("portalNotice");
      if (!status) return;
      status.textContent = label + " sedang disiapkan untuk integrasi. Fitur sumber akan dipertahankan saat migrasi route dan API.";
      status.hidden = false;
      status.focus();
    });
  });

  // Theme preference: explicit choice wins; otherwise follow the operating system.
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const storageKey = "pintuku-theme";
  const systemTheme = window.matchMedia("(prefers-color-scheme: light)");
  let savedTheme = null;
  try { savedTheme = localStorage.getItem(storageKey); } catch (_) {}
  const applyTheme = (theme, persist = false) => {
    const isLight = theme === "light";
    document.documentElement.dataset.theme = isLight ? "light" : "dark";
    document.documentElement.style.colorScheme = isLight ? "light" : "dark";
    if (themeMeta) themeMeta.setAttribute("content", isLight ? "#edf3fa" : "#050c18");
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(isLight));
      themeToggle.setAttribute("aria-label", isLight ? "Aktifkan mode gelap" : "Aktifkan mode terang");
      const label = themeToggle.querySelector(".theme-toggle-label");
      const icon = themeToggle.querySelector(".theme-toggle-icon");
      if (label) label.textContent = isLight ? "Mode gelap" : "Mode terang";
      if (icon) icon.textContent = isLight ? "☾" : "☼";
    }
    if (persist) {
      try { localStorage.setItem(storageKey, theme); } catch (_) {}
    }
  };
  applyTheme(savedTheme === "light" || savedTheme === "dark" ? savedTheme : (systemTheme.matches ? "light" : "dark"));
  if (themeToggle) themeToggle.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light", true);
  });
  systemTheme.addEventListener?.("change", (event) => {
    let preference = null;
    try { preference = localStorage.getItem(storageKey); } catch (_) {}
    if (preference !== "light" && preference !== "dark") applyTheme(event.matches ? "light" : "dark");
  });

  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
        console.error("[PINTUKU] Service worker registration failed", error);
      });
    }, { once: true });
  }
})();
