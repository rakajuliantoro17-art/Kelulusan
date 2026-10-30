/*
==========================================================
Sarprasin 2.0
Tooltip Manager
File : src/components/ui/tooltip/tooltip.js
Version : 2.0.0
==========================================================
*/

let tooltip = null;
let activeTrigger = null;

/* ======================================================
   INIT
====================================================== */

export function initTooltip(container = document) {

    tooltip = document.getElementById("appTooltip");

    if (!tooltip) {

        console.warn("Tooltip component tidak ditemukan.");

        return;

    }

    bindTriggers(container);

    document.addEventListener(

        "keydown",

        handleEscape

    );

}

/* ======================================================
   BIND
====================================================== */

export function bindTriggers(container = document) {

    const triggers = container.querySelectorAll("[data-tooltip]");

    triggers.forEach(trigger => {

        trigger.addEventListener(

            "mouseenter",

            () => showTooltip(trigger)

        );

        trigger.addEventListener(

            "mouseleave",

            hideTooltip

        );

        trigger.addEventListener(

            "focus",

            () => showTooltip(trigger)

        );

        trigger.addEventListener(

            "blur",

            hideTooltip

        );

        trigger.addEventListener(

            "click",

            () => showTooltip(trigger)

        );

    });

}

/* ======================================================
   SHOW
====================================================== */

export function showTooltip(element) {

    if (!tooltip || !element) return;

    activeTrigger = element;

    const content =
        element.dataset.tooltip || "";

    const position =
        element.dataset.tooltipPosition || "auto";

    tooltip.querySelector(

        ".app-tooltip-content"

    ).textContent = content;

    tooltip.hidden = false;

    tooltip.classList.add("show");

    element.setAttribute(

        "aria-describedby",

        "appTooltip"

    );

    positionTooltip(

        element,

        position

    );

}

/* ======================================================
   HIDE
====================================================== */

export function hideTooltip() {

    if (!tooltip) return;

    tooltip.classList.remove("show");

    tooltip.hidden = true;

    if (activeTrigger) {

        activeTrigger.removeAttribute(

            "aria-describedby"

        );

    }

    activeTrigger = null;

}

/* ======================================================
   POSITION
====================================================== */

function positionTooltip(

    element,

    preferred

) {

    const rect =

        element.getBoundingClientRect();

    const tip =

        tooltip.getBoundingClientRect();

    const gap = 10;

    let position = preferred;

    if (preferred === "auto") {

        position =

            rect.top > tip.height + gap

                ? "top"

                : "bottom";

    }

    let top = 0;

    let left = 0;

    switch (position) {

        case "bottom":

            top =

                rect.bottom + gap;

            left =

                rect.left +

                (rect.width - tip.width) / 2;

            break;

        case "left":

            top =

                rect.top +

                (rect.height - tip.height) / 2;

            left =

                rect.left -

                tip.width - gap;

            break;

        case "right":

            top =

                rect.top +

                (rect.height - tip.height) / 2;

            left =

                rect.right + gap;

            break;

        default:

            position = "top";

            top =

                rect.top -

                tip.height - gap;

            left =

                rect.left +

                (rect.width - tip.width) / 2;

    }

    const padding = 8;

    left = Math.max(

        padding,

        Math.min(

            left,

            window.innerWidth -

            tip.width -

            padding

        )

    );

    top = Math.max(

        padding,

        Math.min(

            top,

            window.innerHeight -

            tip.height -

            padding

        )

    );

    tooltip.style.left =

        `${left}px`;

    tooltip.style.top =

        `${top}px`;

    tooltip.dataset.position =

        position;

}

/* ======================================================
   UPDATE
====================================================== */

export function updateTooltip(

    element,

    text

) {

    if (!element) return;

    element.dataset.tooltip = text;

    if (

        activeTrigger === element

    ) {

        showTooltip(element);

    }

}

/* ======================================================
   DESTROY
====================================================== */

export function destroyTooltip() {

    hideTooltip();

}

/* ======================================================
   ESC
====================================================== */

function handleEscape(event) {

    if (

        event.key === "Escape"

    ) {

        hideTooltip();

    }

}

/* ======================================================
   RESIZE
====================================================== */

window.addEventListener(

    "resize",

    () => {

        if (activeTrigger) {

            positionTooltip(

                activeTrigger,

                activeTrigger.dataset.tooltipPosition ||

                "auto"

            );

        }

    }

);

window.addEventListener(

    "scroll",

    () => {

        if (activeTrigger) {

            positionTooltip(

                activeTrigger,

                activeTrigger.dataset.tooltipPosition ||

                "auto"

            );

        }

    },

    true

);

/* ======================================================
   AUTO INIT
====================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        initTooltip();

    }

);

/* ======================================================
   EXPORT
====================================================== */

export default {

    initTooltip,

    bindTriggers,

    showTooltip,

    hideTooltip,

    updateTooltip,

    destroyTooltip

};
