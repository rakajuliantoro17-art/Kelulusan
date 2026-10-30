/*
==========================================================
Sarprasin 2.0
Button Manager
File : src/components/ui/buttons/button.js
Version : 2.0.0
==========================================================
*/

const BUTTON_TYPES = [
    "btn-primary",
    "btn-secondary",
    "btn-success",
    "btn-warning",
    "btn-danger",
    "btn-info",
    "btn-dark",
    "btn-light",
    "btn-outline",
    "btn-ghost",
    "btn-text"
];

const BUTTON_SIZES = [
    "btn-xs",
    "btn-sm",
    "btn-md",
    "btn-lg",
    "btn-xl"
];

const BUTTON_SHAPES = [
    "btn-rounded",
    "btn-pill",
    "btn-square",
    "btn-circle"
];

/* ======================================================
   CREATE
====================================================== */

export function createButton({

    text = "Button",

    type = "primary",

    size = "md",

    shape = "rounded",

    leftIcon = "",

    rightIcon = "",

    ariaLabel = "",

    fullWidth = false,

    disabled = false,

    onClick = null

} = {}) {

    const button = document.createElement("button");

    button.type = "button";

    button.className = [
        "btn",
        `btn-${type}`,
        `btn-${size}`,
        `btn-${shape}`,
        fullWidth ? "full-width" : ""
    ].join(" ").trim();

    button.setAttribute(
        "aria-label",
        ariaLabel || text
    );

    button.innerHTML = `
        <span class="btn-spinner hidden" aria-hidden="true">
            <svg class="btn-spinner-icon" viewBox="0 0 24 24">
                <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="3"
                    fill="none"
                    opacity=".25">
                </circle>
                <path
                    d="M22 12A10 10 0 0 1 12 22"
                    stroke="currentColor"
                    stroke-width="3"
                    fill="none"
                    stroke-linecap="round">
                </path>
            </svg>
        </span>

        <span class="btn-icon btn-icon-left ${leftIcon ? "" : "hidden"}">
            ${leftIcon}
        </span>

        <span class="btn-label">
            ${text}
        </span>

        <span class="btn-icon btn-icon-right ${rightIcon ? "" : "hidden"}">
            ${rightIcon}
        </span>
    `;

    button.disabled = disabled;

    if (typeof onClick === "function") {

        button.addEventListener("click", onClick);

    }

    return button;

}

/* ======================================================
   LABEL
====================================================== */

export function setButtonLabel(

    button,

    text

) {

    const label = button?.querySelector(".btn-label");

    if (label) {

        label.textContent = text;

    }

}

/* ======================================================
   ICON
====================================================== */

export function setLeftIcon(

    button,

    icon

) {

    const el = button?.querySelector(".btn-icon-left");

    if (!el) return;

    el.innerHTML = icon;

    el.classList.toggle("hidden", !icon);

}

export function setRightIcon(

    button,

    icon

) {

    const el = button?.querySelector(".btn-icon-right");

    if (!el) return;

    el.innerHTML = icon;

    el.classList.toggle("hidden", !icon);

}

/* ======================================================
   TYPE
====================================================== */

export function setButtonType(

    button,

    type = "primary"

) {

    BUTTON_TYPES.forEach(cls =>

        button.classList.remove(cls)

    );

    button.classList.add(`btn-${type}`);

}

/* ======================================================
   SIZE
====================================================== */

export function setButtonSize(

    button,

    size = "md"

) {

    BUTTON_SIZES.forEach(cls =>

        button.classList.remove(cls)

    );

    button.classList.add(`btn-${size}`);

}

/* ======================================================
   SHAPE
====================================================== */

export function setButtonShape(

    button,

    shape = "rounded"

) {

    BUTTON_SHAPES.forEach(cls =>

        button.classList.remove(cls)

    );

    button.classList.add(`btn-${shape}`);

}

/* ======================================================
   ENABLE / DISABLE
====================================================== */

export function enableButton(button) {

    button.disabled = false;

    button.classList.remove("disabled");

}

export function disableButton(button) {

    button.disabled = true;

    button.classList.add("disabled");

}

/* ======================================================
   LOADING
====================================================== */

export function setButtonLoading(

    button,

    loading = true,

    text = "Memproses..."

) {

    const spinner = button.querySelector(".btn-spinner");

    const label = button.querySelector(".btn-label");

    if (!spinner || !label) return;

    if (loading) {

        spinner.classList.remove("hidden");

        button.classList.add("loading");

        button.disabled = true;

        label.dataset.previous = label.textContent;

        label.textContent = text;

    } else {

        spinner.classList.add("hidden");

        button.classList.remove("loading");

        button.disabled = false;

        if (label.dataset.previous) {

            label.textContent = label.dataset.previous;

        }

    }

}

/* ======================================================
   TOGGLE
====================================================== */

export function toggleButton(

    button,

    active = true

) {

    button.classList.toggle("active", active);

}

/* ======================================================
   DESTROY
====================================================== */

export function destroyButton(button) {

    button?.remove();

}
