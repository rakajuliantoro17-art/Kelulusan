/*
==========================================================
SARPRASIN v2.0
SMANSASOO Digital System

Environment Configuration
Version : 1.0.0
==========================================================
*/


// ======================================================
// APPLICATION ENVIRONMENT
// ======================================================

export const ENV = {


    APP_NAME:

    import.meta.env.VITE_APP_NAME
    ||
    "SARPRASIN v2.0",



    APP_VERSION:

    import.meta.env.VITE_APP_VERSION
    ||
    "2.0.0",



    MODE:

    import.meta.env.MODE
    ||
    "development",



    IS_DEV:

    import.meta.env.DEV,



    IS_PROD:

    import.meta.env.PROD


};




// ======================================================
// SCHOOL CONFIGURATION
// ======================================================

export const SCHOOL_ENV = {


    NAME:

    import.meta.env.VITE_SCHOOL_NAME
    ||
    "SMAN 1 Sooko",



    CODE:

    import.meta.env.VITE_SCHOOL_CODE
    ||
    "SMANSASOO",



    WEBSITE:

    import.meta.env.VITE_SCHOOL_WEBSITE
    ||
    "https://sman1sooko.sch.id"


};




// ======================================================
// API CONFIGURATION
// ======================================================

export const API_ENV = {


    BASE_URL:

    import.meta.env.VITE_API_BASE_URL
    ||
    "",



    TIMEOUT:

    Number(
        import.meta.env.VITE_API_TIMEOUT
    )
    ||
    10000


};




// ======================================================
// FIREBASE CONFIGURATION
// ======================================================

export const FIREBASE_ENV = {


    API_KEY:

    import.meta.env.VITE_FIREBASE_API_KEY
    ||
    "",



    AUTH_DOMAIN:

    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
    ||
    "",



    DATABASE_URL:

    import.meta.env.VITE_FIREBASE_DATABASE_URL
    ||
    "",



    PROJECT_ID:

    import.meta.env.VITE_FIREBASE_PROJECT_ID
    ||
    "",



    STORAGE_BUCKET:

    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
    ||
    "",



    MESSAGING_SENDER_ID:

    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
    ||
    "",



    APP_ID:

    import.meta.env.VITE_FIREBASE_APP_ID
    ||
    ""


};




// ======================================================
// AUTH CONFIGURATION
// ======================================================

export const AUTH_ENV = {


    SESSION_EXPIRE:

    Number(
        import.meta.env.VITE_SESSION_EXPIRE
    )
    ||
    3600,


    REQUIRE_LOGIN:

    import.meta.env.VITE_REQUIRE_LOGIN !== "false"


};




// ======================================================
// SARPRASIN FEATURE CONFIGURATION
// ======================================================

export const FEATURE_ENV = {


    ENABLE_QR:

    import.meta.env.VITE_ENABLE_QR !== "false",



    ENABLE_REPORT:

    import.meta.env.VITE_ENABLE_REPORT !== "false",



    ENABLE_NOTIFICATION:

    import.meta.env.VITE_ENABLE_NOTIFICATION !== "false",



    ENABLE_DARK_MODE:

    import.meta.env.VITE_ENABLE_DARK_MODE !== "false",



    ENABLE_AI:

    import.meta.env.VITE_ENABLE_AI === "true"


};




// ======================================================
// STORAGE CONFIGURATION
// ======================================================

export const STORAGE_ENV = {


    MAX_UPLOAD_SIZE:

    Number(
        import.meta.env.VITE_MAX_UPLOAD_SIZE
    )
    ||
    5242880,


    STORAGE_PATH:

    import.meta.env.VITE_STORAGE_PATH
    ||
    "assets"


};




// ======================================================
// DEBUG CONFIGURATION
// ======================================================

export const DEBUG_ENV = {


    ENABLE:

    import.meta.env.VITE_DEBUG === "true"



};
