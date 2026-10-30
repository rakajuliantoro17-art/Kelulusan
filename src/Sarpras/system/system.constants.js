/*
==================================================
SARPRASIN v2.0
SYSTEM CONSTANTS
==================================================
*/

export const QUEUE_STATUS = {
    PENDING: "pending",
    RUNNING: "running",
    SUCCESS: "success",
    FAILED: "failed"
};

export const QUEUE_PRIORITY = {
    LOW: "low",
    NORMAL: "normal",
    HIGH: "high"
};

export const VERSION_STATUS = {
    UNKNOWN: "unknown",
    LATEST: "latest",
    UPDATE_AVAILABLE: "update_available"
};

export const ENVIRONMENT = {
    DEVELOPMENT: "development",
    STAGING: "staging",
    PRODUCTION: "production"
};

export const CACHE_TYPE = {
    MEMORY: "memory",
    SESSION: "session",
    LOCAL: "local"
};

export const CACHE_DURATION = {
    SHORT: 60000,
    DEFAULT: 300000,
    LONG: 3600000
};

export const CONFIG_KEY = {
    APP_NAME: "app_name",
    APP_VERSION: "app_version",
    THEME: "theme"
};
