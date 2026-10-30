(() => {
  "use strict";
  const mount = (selector, markup) => {
    const target = document.querySelector(selector);
    if (target) target.innerHTML = markup;
  };
  const currentModule = document.body.dataset.portalModule || "home";
  const currentYear = new Date().getFullYear();
  const links = [
    { id: "home", label: "Beranda", href: "/" },
    { id: "akademik", label: "Akademik", href: "/akademik/" },
    { id: "sarpras", label: "Sarpras", href: "/sarpras/" },
    { id: "kesiswaan", label: "Kesiswaan", href: "/kesiswaan/" }
  ];
  const nav = links.map((item) => {
    const current = item.id === currentModule ? ' aria-current="page"' : "";
    const optional = item.id === "home" ? "" : ' data-optional="true"';
    return '<a href="' + item.href + '"' + current + optional + '>' + item.label + '</a>';
  }).join("");
  const mark = '<span class="portal-shell-mark"><img src="/assets/logo/logo.png" alt="Logo SMAN 1 Sooko" width="52" height="52" decoding="async"></span>';
  const themeControl = currentModule === "home" ? '<button class="portal-theme-toggle" type="button" data-theme-toggle aria-label="Aktifkan mode terang" aria-pressed="false"><span class="theme-toggle-icon" aria-hidden="true">☼</span><span class="theme-toggle-label">Mode terang</span></button>' : "";
  mount("[data-portal-header]", '<header class="portal-shell-header"><div class="portal-shell-inner"><a class="portal-shell-brand" href="/" aria-label="PINTUKU, beranda">' + mark + '<span class="portal-shell-brand-copy"><strong>PINTUKU</strong><span>Pelayanan Integrasi &amp; Data Sekolah Terpadu</span></span></a><div class="portal-shell-actions"><nav class="portal-shell-nav" aria-label="Navigasi portal">' + nav + '</nav>' + themeControl + '</div></div></header>');
  mount("[data-portal-footer]", '<footer class="portal-shell-footer"><div class="portal-shell-footer-inner"><span><strong>PINTUKU</strong> · SMAN 1 Sooko Mojokerto</span><span>© ' + currentYear + ' · Satu Pintu, Terintegrasi, Terpercaya</span></div></footer>');
})();