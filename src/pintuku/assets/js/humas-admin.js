(() => {
  "use strict";
  const date = document.getElementById("haAdminDate");
  const day = document.getElementById("haAdminDay");
  if (date && day) {
    const now = new Date();
    date.textContent = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(now);
    day.textContent = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(now);
  }
  const sidebar = document.getElementById("haSidebar");
  const menu = document.getElementById("haMenuToggle");
  if (sidebar && menu) {
    menu.addEventListener("click", () => {
      const open = sidebar.classList.toggle("is-open");
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "Tutup navigasi" : "Buka navigasi");
    });
    document.addEventListener("click", (event) => {
      if (window.innerWidth <= 900 && sidebar.classList.contains("is-open") &&
          !sidebar.contains(event.target) && !menu.contains(event.target)) {
        sidebar.classList.remove("is-open");
        menu.setAttribute("aria-expanded", "false");
      }
    });
  }
  document.querySelectorAll(".ha-nav-link[href^='#']").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".ha-nav-link").forEach((item) => {
        item.classList.remove("active");
        item.removeAttribute("aria-current");
      });
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
      if (sidebar) sidebar.classList.remove("is-open");
      if (menu) menu.setAttribute("aria-expanded", "false");
    });
  });
  document.querySelectorAll("[data-account-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-account-filter]").forEach((item) => item.classList.remove("is-selected"));
      button.classList.add("is-selected");
    });
  });
})();
