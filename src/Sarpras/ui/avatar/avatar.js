/*
==========================================================
Sarprasin 2.0
Avatar Manager
File : src/components/ui/avatar/avatar.js
Version : 2.0.0
==========================================================
*/

const DEFAULT_ICON = "👤";

const STATUS = {
    online: "#22c55e",
    offline: "#94a3b8",
    busy: "#ef4444",
    away: "#f59e0b"
};

const ROLE = {
    admin: "Admin",
    executive: "Executive",
    user: "User",
    guest: "Guest"
};

function getElement(id) {

    return document.getElementById(id);

}

function getInitials(name = "") {

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join("");

}

/* ======================================================
   CREATE / UPDATE
====================================================== */

export function updateAvatar({

    displayName = "",

    photoURL = "",

    role = "user",

    status = "offline"

} = {}) {

    const image = getElement("avatarImage");

    const initials = getElement("avatarInitials");

    const icon = getElement("avatarIcon");

    const statusBadge = getElement("avatarStatus");

    const roleBadge = getElement("avatarRole");

    const wrapper = getElement("userAvatar");

    if (!wrapper) return;

    wrapper.dataset.role = role;

    wrapper.dataset.status = status;

    roleBadge.textContent = ROLE[role] || ROLE.user;

    statusBadge.style.background = STATUS[status] || STATUS.offline;

    /* ===============================
       Photo
    =============================== */

    if (photoURL) {

        image.src = photoURL;

        image.classList.remove("hidden");

        initials.classList.add("hidden");

        icon.classList.add("hidden");

        image.onerror = () => {

            image.classList.add("hidden");

            initials.classList.remove("hidden");

        };

    }

    /* ===============================
       Initial
    =============================== */

    else if (displayName) {

        initials.textContent = getInitials(displayName);

        initials.classList.remove("hidden");

        image.classList.add("hidden");

        icon.classList.add("hidden");

    }

    /* ===============================
       Default Icon
    =============================== */

    else {

        icon.classList.remove("hidden");

        image.classList.add("hidden");

        initials.classList.add("hidden");

    }

}

/* ======================================================
   CLEAR
====================================================== */

export function clearAvatar() {

    updateAvatar({

        displayName: "",

        photoURL: "",

        role: "guest",

        status: "offline"

    });

}

/* ======================================================
   STATUS
====================================================== */

export function updateStatus(status = "offline") {

    const badge = getElement("avatarStatus");

    const wrapper = getElement("userAvatar");

    if (!badge || !wrapper) return;

    wrapper.dataset.status = status;

    badge.style.background = STATUS[status] || STATUS.offline;

}

/* ======================================================
   ROLE
====================================================== */

export function updateRole(role = "user") {

    const badge = getElement("avatarRole");

    const wrapper = getElement("userAvatar");

    if (!badge || !wrapper) return;

    wrapper.dataset.role = role;

    badge.textContent = ROLE[role] || ROLE.user;

}

/* ======================================================
   SIZE
====================================================== */

export function setAvatarSize(size = "md") {

    const wrapper = getElement("userAvatar");

    if (!wrapper) return;

    wrapper.classList.remove(
        "avatar-sm",
        "avatar-md",
        "avatar-lg",
        "avatar-xl"
    );

    wrapper.classList.add(`avatar-${size}`);

}

/* ======================================================
   INIT
====================================================== */

export function initAvatar(user = {}) {

    updateAvatar({

        displayName: user.displayName,

        photoURL: user.photoURL,

        role: user.role,

        status: user.status

    });

}
