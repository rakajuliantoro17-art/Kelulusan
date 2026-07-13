/*
==========================================================
SMANSASOO Graduation Portal
Configuration
Version : 2.0.0
==========================================================

Portal Pengumuman Kelulusan
SMAN 1 Sooko Mojokerto

Seluruh konfigurasi aplikasi dipusatkan pada file ini.

==========================================================
*/

window.CONFIG = {

    /* ======================================================
       APPLICATION
    ====================================================== */

    APP_NAME: "SMANSASOO Graduation Portal",

    VERSION: "2.0.0",

    SCHOOL_NAME: "SMAN 1 Sooko Mojokerto",

    ACADEMIC_YEAR: "2025/2026",

    ANNOUNCEMENT_TITLE:
        "Pengumuman Kelulusan",

    ANNOUNCEMENT_YEAR:
        "2026",

    /* ======================================================
       ENVIRONMENT
    ====================================================== */

    ENVIRONMENT: "production",

    // true = membaca data/sample.json
    // false = membaca Google Apps Script

    USE_SAMPLE_DATA: false,



    /* ======================================================
       API
    ====================================================== */

    API_BASE_URL:

    "https://script.google.com/macros/s/AKfycbwAbjqiwBFp-xQAZVmcrybhC31FEDH054MS4_mSHgb2hjr15KnL4G-KGfiUhaB_52gsoA/exec",

    API_ACTIONS:{

        STUDENT:"student",

        STATUS:"status",

        SETTINGS:"settings",

        VERSION:"version"

    },

    SAMPLE_DATA_URL:

    "data/sample.json",

    API_TIMEOUT:10000,



    /* ======================================================
       SEARCH
    ====================================================== */

    SEARCH_MIN_LENGTH:4,

    SEARCH_PLACEHOLDER:

    "Masukkan NIS atau NISN",



    /* ======================================================
       RESULT STATUS
    ====================================================== */

    STATUS_PASS:"LULUS",

    STATUS_NOT_PASS:"TIDAK LULUS",



    /* ======================================================
       VISUAL
    ====================================================== */

    BACKGROUND_IMAGE:

    "assets/images/scc.jpg",

    LOGO:

    "assets/logo/logo.png",

    ICON:

    "assets/icons/icon.png",

    FAVICON:

    "favicon.ico",



    /* ======================================================
       CELEBRATION
    ====================================================== */

    ENABLE_CELEBRATION:true,

    ENABLE_CONFETTI:true,

    ENABLE_BALLOON:true,

    ENABLE_FLASH:true,



    ENABLE_AUDIO:true,



    AUDIO_URL:

    "assets/audio/lulus.mp3",



    CONFETTI_PARTICLE:180,

    CONFETTI_SPREAD:120,



    BALLOON_COUNT:16,



    /* ======================================================
       LOADING
    ====================================================== */

    ENABLE_LOADING:true,

    LOADING_DELAY:1800,



    /* ======================================================
       CACHE
    ====================================================== */

    ENABLE_CACHE:false,

    CACHE_DURATION:300000,



    /* ======================================================
       PWA
    ====================================================== */

    ENABLE_PWA:true,

    ENABLE_OFFLINE:false,



    /* ======================================================
       DEBUG
    ====================================================== */

    ENABLE_CONSOLE_LOG:false,



    /* ======================================================
       MESSAGE
    ====================================================== */

    MESSAGE:{

        EMPTY_KEYWORD:

        "Silakan masukkan NIS atau NISN.",

        NOT_FOUND:

        "Data siswa tidak ditemukan.",

        SERVER_ERROR:

        "Terjadi kesalahan pada server.",

        LOADING:

        "Sedang memproses data...",

        SUCCESS:

        "Data berhasil ditemukan.",

        PASS_MESSAGE:

        "Selamat! Anda dinyatakan LULUS.",

        NOT_PASS_MESSAGE:

        "Silakan menghubungi pihak sekolah untuk informasi lebih lanjut."

    }

};


/* ======================================================
   READ ONLY
====================================================== */

Object.freeze(window.CONFIG);

Object.freeze(window.CONFIG.API_ACTIONS);

Object.freeze(window.CONFIG.MESSAGE);
