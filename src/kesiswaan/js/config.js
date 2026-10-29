/*
==========================================================
SMANSASOO Kesiswaan Portal
Konfigurasi aplikasi (dibaca js/shell.js dan halaman)
==========================================================
*/
window.CONFIG = {

    APP_NAME: "Portal Gerakan Disiplin Sekolah",

    VERSION: "1.0.0",

    SCHOOL_NAME: "SMAN 1 Sooko Mojokerto",

    // Identitas unit & program (tampil di navbar dan sidebar)
    UNIT_NAME: "Kesiswaan & Kedisiplinan",
    PROGRAM_NAME: "Gerakan Disiplin Sekolah",
    COMMITTEE_NAME: "Komisi Disiplin Sekolah",
    PROGRAM_SLOGAN: "Bersama, Berkreasi, dan Berprestasi",

    ACADEMIC_YEAR: "2026/2027",

    // Poin kumulatif per tahun ajaran (reset tiap 1 Juli).
    // Tingkat sanksi lengkap ada di data/tata-tertib.json.
    API: {
        DASHBOARD: "/api/kesiswaan?op=dashboard",
        CEK_POIN: "/api/kesiswaan?op=cek-poin",
        TATA_TERTIB: "/api/kesiswaan?op=tata-tertib",
        PELANGGARAN: "/api/kesiswaan?op=pelanggaran",
        PEMBINAAN: "/api/kesiswaan?op=pembinaan",
        SURAT: "/api/kesiswaan?op=surat",
        RINGKASAN: "/api/kesiswaan?op=ringkasan",
        EKSEKUTIF: "/api/kesiswaan?op=eksekutif",
        TANYA: "/api/kesiswaan?op=tanya",
        WALIKELAS: "/api/kesiswaan?op=walikelas",
        QR: "/api/kesiswaan?op=qr",
        PERAPIAN: "/api/kesiswaan?op=perapian",
        AI_CATAT: "/api/kesiswaan?op=ai-catat",
        ADMIN_AUTH: "/api/kesiswaan?op=admin-auth"
    },

    API_TIMEOUT: 12000

};

Object.freeze(window.CONFIG);
Object.freeze(window.CONFIG.API);
