/*
==========================================================
SMANSASOO Kesiswaan Portal
Bagian "Akun" untuk panel pengaturan (gerigi mengambang)
==========================================================
Sebelumnya modul ini membuat tombol melayang sendiri ("Komisi
Disiplin") di samping gerigi pengaturan, sehingga ada dua tombol
yang saling menumpuk. Sekarang hanya ada SATU tombol: gerigi dari
js/settings-drawer.js. Modul ini hanya menyediakan isi bagian akun
di dalam panel gerigi itu:
  - belum masuk : formulir login
  - sudah masuk : kartu sesi, menu sesuai peran, tombol Keluar

API: AdminBadge.renderInto(elemen)  -> menggambar ulang isi akun
     AdminBadge.summary()           -> { logged, label } untuk gerigi
Dimuat otomatis oleh js/shell.js setelah js/admin-auth.js.
==========================================================
*/
window.AdminBadge = (() => {

    // Semua halaman Kesiswaan ada di bawah /kesiswaan (portal PINTUKU), bukan di akar situs.
    const P = "/kesiswaan/pages/";

    const MENU = [
        { href: P + "admin.html#input", title: "Catat Pelanggaran", desc: "Input pelanggaran baru ke Google Sheet", icon: "✍️" },
        { href: P + "admin.html#data", title: "Data Pelanggaran", desc: "Cari, filter, dan unduh CSV", icon: "🗂️" },
        { href: P + "admin.html#pembinaan", title: "Perlu Pembinaan", desc: "Siswa dengan poin tertinggi & tindak lanjut", icon: "🛡️" },
        { href: P + "admin.html#ringkasan", title: "Ringkasan Harian", desc: "Ringkasan, siswa terlambat ditangani & cek data", icon: "📋" },
        { href: P + "admin.html#perapian", title: "Rapikan Data", desc: "Usulan perbaikan data siswa, disetujui per baris", icon: "🧹" },
        { href: P + "qr.html", title: "Kartu & Pindai QR", desc: "Pindai kartu siswa, cetak QR kelas", icon: "📷" }
    ];

    const MENU_EKS = [
        { href: P + "eksekutif.html", title: "KPI & Infografis", desc: "Ringkasan capaian disiplin untuk pimpinan", icon: "📈" }
    ];

    const MENU_QR = [{ href: P + "qr.html", title: "Kartu & Pindai QR", desc: "Pindai kartu siswa, cetak QR kelas", icon: "📷" }];

    const MENU_WALI = [
        { href: P + "walikelas.html", title: "Rekomendasi Mingguan", desc: "Ringkasan dan saran untuk kelas Anda", icon: "🧑‍🏫" },
        { href: P + "qr.html", title: "Kartu & Pindai QR", desc: "Pindai kartu siswa, cetak QR kelas", icon: "📷" }
    ];

    let loginCtl = null;

    function fmtTime(exp) {
        try {
            return new Date(exp * 1000).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
        } catch (e) { return ""; }
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

    function roleLabel(auth) {
        return auth.hasRole("komisi") ? "Komisi aktif"
            : auth.hasRole("kesiswaan") ? "Kesiswaan aktif"
            : auth.hasRole("walikelas") ? "Wali kelas aktif"
            : "Eksekutif aktif";
    }

    function menuFor(auth) {
        return [].concat(
            auth.hasRole("eksekutif") ? MENU_EKS : [],
            auth.hasRole("walikelas") ? MENU_WALI : [],
            auth.hasRole("komisi") ? MENU
                : auth.hasRole("kesiswaan") ? MENU.filter((m) => /#(data|pembinaan)$/.test(m.href)).concat(MENU_QR)
                : []
        );
    }

    function summary() {
        const auth = window.AdminAuth;
        const logged = !!(auth && auth.isLoggedIn());
        return { logged, label: logged ? roleLabel(auth) : "Belum masuk" };
    }

    function renderInto(host) {

        if (!host) return;

        const auth = window.AdminAuth;
        const logged = !!(auth && auth.isLoggedIn());
        let html = "";

        if (!auth) {
            html = '<p class="kd-panel-note">Modul login belum termuat. Muat ulang halaman.</p>';
        } else if (!logged) {
            html = `
            <h3 class="kd-panel-h">Masuk Staf Sekolah</h3>
            <p class="kd-panel-note">Untuk Komisi Disiplin, Kesiswaan &amp; BK, wali kelas, dan pimpinan sekolah.</p>
            <div id="kdPanelLogin"></div>`;
        } else {
            html = `
            <div class="kd-user-chip">
                <span class="kd-user-dot" aria-hidden="true"></span>
                <span><strong>${escapeHtml(auth.displayName())}</strong><small>${roleLabel(auth)} · sesi sampai ${fmtTime(auth.expiresAt())}</small></span>
            </div>
            ${auth.insecure() ? '<p class="kd-panel-warn">⚠️ Server masih memakai pengaman bawaan. Atur <code>ADMIN_PASSWORD</code> dan <code>ADMIN_SESSION_SECRET</code> di Vercel sebelum dipakai sungguhan.</p>' : ""}
            <ul class="kd-menu">
                ${menuFor(auth).map((m) => `
                <li><a class="kd-menu-item" href="${m.href}">
                    <span class="kd-menu-ico" aria-hidden="true">${m.icon}</span>
                    <span class="kd-menu-text"><strong>${m.title}</strong><small>${m.desc}</small></span>
                </a></li>`).join("")}
            </ul>
            <button type="button" class="kd-btn kd-btn--ghost kd-btn--block" id="kdPanelLogout">Keluar</button>`;
        }

        host.innerHTML = html;

        const slot = host.querySelector("#kdPanelLogin");
        if (slot && auth) {
            loginCtl = auth.buildLoginForm(() => {
                renderInto(host);
                const first = host.querySelector(".kd-menu-item");
                if (first) first.focus();
            });
            slot.appendChild(loginCtl.form);
        }

        const out = host.querySelector("#kdPanelLogout");
        if (out) {
            out.addEventListener("click", () => {
                auth.logout();
                // di halaman khusus staf, keluar = kembali ke beranda Kesiswaan
                if (/\/pages\/(admin|eksekutif|walikelas)(\.html)?$/.test(location.pathname)) { location.href = "/kesiswaan"; return; }
                renderInto(host);
            });
        }
    }

    function focusLogin() {
        if (loginCtl && !(window.AdminAuth && AdminAuth.isLoggedIn())) setTimeout(() => loginCtl.focus(), 60);
    }

    return { renderInto, summary, focusLogin };

})();
