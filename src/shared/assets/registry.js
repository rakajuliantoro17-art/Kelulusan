(function (root) {
  "use strict";
  // Canonical public asset paths for every SMANSASOO module.
  // Framework-free for classic scripts and legacy pages.
  const paths = {
    shared: {
      icons: { app: "/assets/shared/icons/app-icon.png", favicon: "/assets/shared/icons/favicon.ico" },
      logos: { school: "/assets/shared/logos/sman1-sooko.png" },
      images: {
        backgroundDrh: "/assets/shared/images/drh.jpg",
        backgroundScc: "/assets/shared/images/scc.jpg",
        syari: "/assets/shared/images/syari.jpg"
      },
      fonts: {
        inter: "/assets/shared/fonts/Inter/",
        jetBrainsMono: "/assets/shared/fonts/JetBrainsMono/",
        poppins: "/assets/shared/fonts/Poppins/"
      }
    },
    akademik: {
      audio: { lulus: "/assets/akademik/audio/lulus.mp3", naikKelas: "/assets/akademik/audio/naik-kelas.mp3" },
      images: {
        skr: "/assets/akademik/images/Skr.jpg",
        gbl: "/assets/akademik/images/gbl.jpg",
        gtr: "/assets/akademik/images/gtr.jpg",
        syari: "/assets/akademik/images/syari.png",
        tyr: "/assets/akademik/images/tyr.jpg"
      }
    },
    kesiswaan: {
      logos: {
        jatim: "/assets/kesiswaan/logos/jatim-transparan.png",
        kopJatim: "/assets/kesiswaan/logos/kop-jatim.png",
        kopJatimTransparan: "/assets/kesiswaan/logos/kop-jatim-transparan.png"
      },
      signatures: { kepalaSekolah: "/assets/kesiswaan/signatures/ttd-kepsek.png" }
    },
    sarpras: { images: { item119: "/assets/sarpras/images/119.jpg" } }
  };
  function get(key) {
    if (typeof key !== "string" || !key.trim()) return undefined;
    return key.split(".").reduce((value, part) =>
      value && Object.prototype.hasOwnProperty.call(value, part) ? value[part] : undefined, paths);
  }
  root.SMANAssets = Object.freeze({
    paths: paths,
    get: get,
    has: function (key) { return typeof get(key) === "string"; }
  });
  if (typeof module !== "undefined" && module.exports) module.exports = root.SMANAssets;
})(typeof window !== "undefined" ? window : globalThis);
