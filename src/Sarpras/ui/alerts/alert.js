/*
==========================================================
Sarprasin 2.0
Global Alert Manager
File : src/components/ui/alerts/alert.js
Version : 2.0.0
==========================================================
*/

const DEFAULT_TIMEOUT = 5000;

const ALERT_TYPES = {
    success: {
        className: "alert-success",
        icon: "✅",
        title: "Berhasil"
    },

    info: {
        className: "alert-info",
        icon: "ℹ️",
        title: "Informasi"
    },

    warning: {
        className: "alert-warning",
        icon: "⚠️",
        title: "Peringatan"
    },

    danger: {
        className: "alert-danger",
        icon: "❌",
        title: "Kesalahan"
    },

    primary: {
        className: "alert-primary",
        icon: "📌",
        title: "Pemberitahuan"
    }
};

let timer = null;

const element = () => document.getElementById("appAlert");

const icon = () => document.getElementById("alertIcon");

const title = () => document.getElementById("alertTitle");

const message = () => document.getElementById("alertMessage");

const timestamp = () => document.getElementById("alertTimestamp");

const actionButton = () => document.getElementById("alertActionButton");

const closeButton = () => document.getElementById("alertCloseButton");

/* ======================================================
   SHOW ALERT
====================================================== */

export function showAlert({

    type = "info",

    title: customTitle,

    message: text = "",

    timestampText = "Baru saja",

    dismissible = true,

    timeout = DEFAULT_TIMEOUT,

    actionText = "",

    onAction = null

} = {}) {

    const alert = element();

    if (!alert) return;

    clearTimeout(timer);

    const config = ALERT_TYPES[type] || ALERT_TYPES.info;

    alert.className = `alert ${config.className}`;

    alert.classList.remove("hidden");

    icon().textContent = config.icon;

    title().textContent = customTitle || config.title;

    message().textContent = text;

    timestamp().textContent = timestampText;

    if (actionText) {

        actionButton().textContent = actionText;

        actionButton().classList.remove("hidden");

        actionButton().onclick = onAction;

    } else {

        actionButton().classList.add("hidden");

        actionButton().onclick = null;

    }

    closeButton().style.display = dismissible
        ? ""
        : "none";

    if (timeout > 0) {

        timer = setTimeout(() => {

            hideAlert();

        }, timeout);

    }

}

/* ======================================================
   HIDE
====================================================== */

export function hideAlert() {

    const alert = element();

    if (!alert) return;

    clearTimeout(timer);

    alert.classList.add("hidden");

}

/* ======================================================
   UPDATE
====================================================== */

export function updateAlert({

    title,

    message,

    timestampText

}) {

    if (title)
        document.getElementById("alertTitle").textContent = title;

    if (message)
        document.getElementById("alertMessage").textContent = message;

    if (timestampText)
        document.getElementById("alertTimestamp").textContent = timestampText;

}

/* ======================================================
   SHORTCUTS
====================================================== */

export const success = (message, options = {}) =>
    showAlert({
        ...options,
        type: "success",
        message
    });

export const info = (message, options = {}) =>
    showAlert({
        ...options,
        type: "info",
        message
    });

export const warning = (message, options = {}) =>
    showAlert({
        ...options,
        type: "warning",
        message
    });

export const danger = (message, options = {}) =>
    showAlert({
        ...options,
        type: "danger",
        message
    });

/* ======================================================
   INIT
====================================================== */

export function initAlert() {

    const button = closeButton();

    if (!button) return;

    button.addEventListener("click", hideAlert);

}
