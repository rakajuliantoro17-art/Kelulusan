(() => {
  "use strict";
  const date = document.getElementById("haAdminDate");
  const day = document.getElementById("haAdminDay");
  if (date && day) {
    const now = new Date();
    date.textContent = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(now);
    day.textContent = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(now);
  }
  document.querySelectorAll(".ha-admin-nav a[href^='#']").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".ha-admin-nav a").forEach((item) => {
        item.classList.remove("is-active");
        item.removeAttribute("aria-current");
      });
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    });
  });
})();
