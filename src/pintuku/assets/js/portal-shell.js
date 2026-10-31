(() => {
  "use strict";
  const mount = (selector, markup) => {
    const target = document.querySelector(selector);
    if (target) target.innerHTML = markup;
  };
  const currentYear = new Date().getFullYear();
  const schoolLogo = window.SMANAssets?.get("shared.logos.school") || "/assets/shared/logos/sman1-sooko.png";
  const mark = '<span class="portal-shell-mark"><img src="' + schoolLogo + '" alt="Logo SMAN 1 Sooko" width="52" height="52" decoding="async"></span>';
  mount("[data-portal-header]", '<header class="portal-shell-header"><div class="portal-shell-inner"><a class="portal-shell-brand" href="/" aria-label="PINTUKU, beranda">' + mark + '<span class="portal-shell-brand-copy"><strong>PINTUKU</strong><span>Pelayanan Integrasi &amp; Data Sekolah Terpadu</span></span></a></div></header>');
  mount("[data-portal-footer]", '<footer class="portal-shell-footer"><div class="portal-shell-footer-inner"><span><strong>PINTUKU</strong> · SMAN 1 Sooko Mojokerto</span><span>© ' + currentYear + ' · Satu Pintu, Terintegrasi, Terpercaya</span></div></footer>');
})();