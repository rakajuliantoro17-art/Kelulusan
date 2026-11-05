(() => {
  "use strict";
  const menu = document.getElementById("haaMenu");
  const side = document.querySelector(".haa-side");
  if (menu && side) menu.addEventListener("click", () => {
    const open = side.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Tutup navigasi" : "Buka navigasi");
  });
  document.querySelectorAll("[data-status]").forEach((tab) => tab.addEventListener("click", () => {
    document.querySelectorAll("[data-status]").forEach((item) => {
      item.classList.toggle("selected", item === tab);
      item.setAttribute("aria-selected", String(item === tab));
    });
    // Status filter UI is ready; no rows are fabricated while the API is disconnected.
  }));
  const search = document.getElementById("haaSearch");
  const type = document.getElementById("haaType");
  const sort = document.getElementById("haaSort");
  [search, type, sort].forEach((control) => {
    if (control) control.addEventListener("change", () => {
      const count = document.getElementById("haaCount");
      if (count) count.textContent = "0 akun ditampilkan · data belum terhubung";
    });
  });
  const modal = document.getElementById("haaModal");
  const show = document.getElementById("haaShowDecision");
  const close = document.getElementById("haaModalClose");
  if (show && modal) show.addEventListener("click", () => { modal.hidden = false; const reason = document.getElementById("haaModalReason"); if (reason) reason.focus(); });
  if (close && modal) close.addEventListener("click", () => { modal.hidden = true; });
  if (modal) modal.addEventListener("click", (event) => { if (event.target === modal) modal.hidden = true; });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && modal) modal.hidden = true; });
})();