/*
==========================================================
Sarprasin 2.0
Badge Manager
File : src/components/ui/badges/badge.js
Version : 2.0.0
==========================================================
*/

const BADGE_TYPES = {

    primary: "badge-primary",

    secondary: "badge-secondary",

    success: "badge-success",

    warning: "badge-warning",

    danger: "badge-danger",

    info: "badge-info",

    dark: "badge-dark",

    light: "badge-light",

    outline: "badge-outline"

};

const BADGE_SIZES = {

    sm: "badge-sm",

    md: "badge-md",

    lg: "badge-lg"

};

const BADGE_SHAPES = {

    rounded: "badge-rounded",

    pill: "badge-pill",

    square: "badge-square"

};

/* ======================================================
   CREATE
====================================================== */

export function createBadge({

    text = "",

    type = "primary",

    size = "md",

    shape = "pill",

    icon = "",

    className = ""

} = {}) {

    const badge = document.createElement("span");

    badge.classList.add("badge");

    badge.classList.add(
        BADGE_TYPES[type] || BADGE_TYPES.primary
    );

    badge.classList.add(
        BADGE_SIZES[size] || BADGE_SIZES.md
    );

    badge.classList.add(
        BADGE_SHAPES[shape] || BADGE_SHAPES.pill
    );

    if (className) {

        badge.classList.add(className);

    }

    if (icon) {

        const iconElement = document.createElement("span");

        iconElement.className = "badge-icon";

        iconElement.textContent = icon;

        badge.append(iconElement);

    }

    const textNode = document.createElement("span");

    textNode.className = "badge-text";

    textNode.textContent = text;

    badge.append(textNode);

    return badge;

}

/* ======================================================
   UPDATE
====================================================== */

export function updateBadge(

    badge,

    {

        text,

        type,

        size,

        shape

    } = {}

) {

    if (!badge) return;

    Object.values(BADGE_TYPES).forEach(value =>

        badge.classList.remove(value)

    );

    Object.values(BADGE_SIZES).forEach(value =>

        badge.classList.remove(value)

    );

    Object.values(BADGE_SHAPES).forEach(value =>

        badge.classList.remove(value)

    );

    badge.classList.add(

        BADGE_TYPES[type] || BADGE_TYPES.primary

    );

    badge.classList.add(

        BADGE_SIZES[size] || BADGE_SIZES.md

    );

    badge.classList.add(

        BADGE_SHAPES[shape] || BADGE_SHAPES.pill

    );

    const textElement = badge.querySelector(".badge-text");

    if (textElement && text !== undefined) {

        textElement.textContent = text;

    }

}

/* ======================================================
   REMOVE
====================================================== */

export function removeBadge(

    badge

) {

    if (badge?.remove) {

        badge.remove();

    }

}

/* ======================================================
   SHORTCUTS
====================================================== */

export const successBadge = (text) =>

    createBadge({

        text,

        type: "success",

        icon: "✔"

    });

export const warningBadge = (text) =>

    createBadge({

        text,

        type: "warning",

        icon: "⚠"

    });

export const dangerBadge = (text) =>

    createBadge({

        text,

        type: "danger",

        icon: "✖"

    });

export const infoBadge = (text) =>

    createBadge({

        text,

        type: "info",

        icon: "ℹ"

    });

/* ======================================================
   FIRESTORE HELPERS
====================================================== */

export function badgeFromStatus(

    status = ""

) {

    switch (status.toLowerCase()) {

        case "tersedia":

            return successBadge("Tersedia");

        case "dipinjam":

            return createBadge({

                text: "Dipinjam",

                type: "info",

                icon: "📦"

            });

        case "maintenance":

            return warningBadge("Maintenance");

        case "rusak":

            return dangerBadge("Rusak");

        case "draft":

            return createBadge({

                text: "Draft",

                type: "secondary"

            });

        default:

            return createBadge({

                text: status,

                type: "primary"

            });

    }

}

/* ======================================================
   PRIORITY
====================================================== */

export function badgeFromPriority(

    priority = ""

) {

    switch (priority.toLowerCase()) {

        case "low":

            return createBadge({

                text: "Low",

                type: "secondary"

            });

        case "normal":

            return infoBadge("Normal");

        case "high":

            return warningBadge("High");

        case "critical":

            return dangerBadge("Critical");

        default:

            return createBadge({

                text: priority

            });

    }

}

/* ======================================================
   ROLE
====================================================== */

export function badgeFromRole(

    role = ""

) {

    switch (role.toLowerCase()) {

        case "admin":

            return createBadge({

                text: "Admin",

                type: "danger"

            });

        case "executive":

            return createBadge({

                text: "Executive",

                type: "primary"

            });

        case "user":

            return createBadge({

                text: "User",

                type: "info"

            });

        default:

            return createBadge({

                text: "Guest",

                type: "secondary"

            });

    }

}
