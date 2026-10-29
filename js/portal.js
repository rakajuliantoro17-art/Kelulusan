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

  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
        console.error("[SMANSASOO Digital Portal] Service worker registration failed", error);
      });
    }, { once: true });
  }
})();
