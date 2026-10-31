/*
==========================================================
SARPRASIN v2.0
SMANSASOO Digital System

Application Constants
Version : 1.0.0
==========================================================
*/


// ======================================================
// APPLICATION INFO
// ======================================================

export const APP = {

    NAME:
    "SARPRASIN v2.0",

    FULL_NAME:
    "Smart School Asset Management System",

    SCHOOL:
    "SMAN 1 Sooko Mojokerto",

    CODE:
    "SMANSASOO",

    VERSION:
    "2.0.0",

    AUTHOR:
    "SMAN 1 Sooko Mojokerto"

};




// ======================================================
// SCHOOL INFORMATION
// ======================================================

export const SCHOOL = {

    NAME:
    "SMAN 1 Sooko",

    CITY:
    "Mojokerto",

    PROVINCE:
    "Jawa Timur",

    WEBSITE:
    "https://sman1sooko.sch.id"

};




// ======================================================
// USER ROLE
// ======================================================

export const USER_ROLE = {

    ADMIN:
    "admin",

    WAKA_SARPRAS:
    "waka_sarpras",

    OPERATOR:
    "operator",

    STAFF:
    "staff",

    ARSIPARIS:
    "arsiparis",

    GURU:
    "guru",

    WALI_KELAS:
    "wali_kelas",

    VIEWER:
    "viewer"

};




// ======================================================
// ASSET STATUS
// ======================================================

export const ASSET_STATUS = {


    BAIK:
    "baik",


    RUSAK_RINGAN:
    "rusak_ringan",


    RUSAK_BERAT:
    "rusak_berat",


    PERBAIKAN:
    "perbaikan",


    HILANG:
    "hilang",


    DISPOSAL:
    "disposal"


};




// ======================================================
// ASSET CONDITION LABEL
// ======================================================

export const CONDITION_LABEL = {


    baik:
    "Baik",


    rusak_ringan:
    "Rusak Ringan",


    rusak_berat:
    "Rusak Berat",


    perbaikan:
    "Dalam Perbaikan",


    hilang:
    "Hilang",


    disposal:
    "Penghapusan"


};




// ======================================================
// ASSET CATEGORY
// ======================================================

export const ASSET_CATEGORY = {


    ELECTRONIC:
    "Elektronik",


    COMPUTER:
    "Komputer & IT",


    FURNITURE:
    "Furniture",


    VEHICLE:
    "Kendaraan",


    BUILDING:
    "Bangunan",


    LAB:
    "Laboratorium",


    SPORT:
    "Olahraga",


    OTHER:
    "Lainnya"


};




// ======================================================
// MAINTENANCE STATUS
// ======================================================

export const MAINTENANCE_STATUS = {


    OPEN:
    "open",


    PROCESS:
    "process",


    DONE:
    "done",


    CANCEL:
    "cancel"


};




// ======================================================
// REPORT TYPE
// ======================================================

export const REPORT_TYPE = {


    ASSET:
    "asset_report",


    MAINTENANCE:
    "maintenance_report",


    INVENTORY:
    "inventory_report",


    AUDIT:
    "audit_report"


};




// ======================================================
// DASHBOARD CONFIGURATION
// ======================================================

export const DASHBOARD = {


    ITEMS_PER_PAGE:
    10,


    CHART_ANIMATION:
    true,


    DEFAULT_THEME:
    "light-theme"


};




// ======================================================
// PAGINATION
// ======================================================

export const PAGINATION = {


    DEFAULT_LIMIT:
    10,


    MAX_LIMIT:
    100


};




// ======================================================
// FILE UPLOAD
// ======================================================

export const UPLOAD = {


    MAX_SIZE:

    5 * 1024 * 1024,


    ALLOWED_IMAGE:

    [
        "image/jpeg",
        "image/png",
        "image/webp"
    ],


    ALLOWED_DOCUMENT:

    [
        "application/pdf"
    ]


};




// ======================================================
// QR CODE CONFIG
// ======================================================

export const QR_CONFIG = {


    PREFIX:
    "SARPRASIN",


    SIZE:
    300,


    ERROR_CORRECTION:
    "H"


};




// ======================================================
// FIREBASE COLLECTION
// ======================================================

export const COLLECTION = {


    USERS:
    "users",


    ASSETS:
    "assets",


    ROOMS:
    "rooms",


    MAINTENANCE:
    "maintenance",


    REPORTS:
    "reports",


    LOGS:
    "logs"


};




// ======================================================
// SYSTEM FEATURE FLAG
// ======================================================

export const FEATURE = {


    QR_SCAN:
    true,


    PDF_REPORT:
    true,


    DARK_MODE:
    true,


    NOTIFICATION:
    true,


    AUDIT_LOG:
    true,


    AI_ANALYSIS:
    false


};




// ======================================================
// DATE FORMAT
// ======================================================

export const DATE_FORMAT = {


    DISPLAY:
    "DD MMMM YYYY",


    DATABASE:
    "YYYY-MM-DD"


};

