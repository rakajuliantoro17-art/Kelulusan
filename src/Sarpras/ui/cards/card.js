/*
==========================================================
Sarprasin 2.0
Card Manager
File : src/components/ui/cards/card.js
Version : 2.0.0
==========================================================
*/

const CARD_VARIANTS = [
    "card-default",
    "card-glass",
    "card-outline",
    "card-elevated",
    "card-flat"
];

const CARD_SIZES = [
    "card-sm",
    "card-md",
    "card-lg",
    "card-xl"
];

/* ======================================================
   CREATE
====================================================== */

export function createCard({

    title = "",

    subtitle = "",

    content = "",

    footer = "",

    icon = "",

    actions = [],

    variant = "glass",

    size = "md",

    className = "",

    id = ""

} = {}) {

    const card = document.createElement("article");

    if (id) card.id = id;

    card.className = [
        "card",
        `card-${variant}`,
        `card-${size}`,
        className
    ].filter(Boolean).join(" ");

    /* ---------- Header ---------- */

    const header = document.createElement("header");
    header.className = "card-header";

    if (icon) {

        const iconElement = document.createElement("span");
        iconElement.className = "card-icon";
        iconElement.innerHTML = icon;

        header.append(iconElement);

    }

    const titleWrapper = document.createElement("div");
    titleWrapper.className = "card-heading";

    const titleElement = document.createElement("h3");
    titleElement.className = "card-title";
    titleElement.textContent = title;

    titleWrapper.append(titleElement);

    if (subtitle) {

        const subtitleElement = document.createElement("p");
        subtitleElement.className = "card-subtitle";
        subtitleElement.textContent = subtitle;

        titleWrapper.append(subtitleElement);

    }

    header.append(titleWrapper);

    /* ---------- Body ---------- */

    const body = document.createElement("section");
    body.className = "card-body";

    if (typeof content === "string") {

        body.innerHTML = content;

    } else if (content instanceof HTMLElement) {

        body.append(content);

    }

    /* ---------- Footer ---------- */

    const footerElement = document.createElement("footer");
    footerElement.className = "card-footer";

    if (typeof footer === "string") {

        footerElement.innerHTML = footer;

    } else if (footer instanceof HTMLElement) {

        footerElement.append(footer);

    }

    /* ---------- Actions ---------- */

    const actionContainer = document.createElement("div");
    actionContainer.className = "card-actions";

    actions.forEach(button => {

        if (button instanceof HTMLElement) {

            actionContainer.append(button);

        }

    });

    if (actions.length) {

        footerElement.append(actionContainer);

    }

    card.append(

        header,

        body,

        footerElement

    );

    return card;

}

/* ======================================================
   UPDATE
====================================================== */

export function updateCard(

    card,

    {

        title,

        subtitle,

        content,

        footer

    } = {}

) {

    if (!card) return;

    if (title !== undefined) {

        const el = card.querySelector(".card-title");

        if (el) el.textContent = title;

    }

    if (subtitle !== undefined) {

        const el = card.querySelector(".card-subtitle");

        if (el) el.textContent = subtitle;

    }

    if (content !== undefined) {

        const el = card.querySelector(".card-body");

        if (!el) return;

        if (typeof content === "string") {

            el.innerHTML = content;

        } else {

            el.replaceChildren(content);

        }

    }

    if (footer !== undefined) {

        const el = card.querySelector(".card-footer");

        if (!el) return;

        if (typeof footer === "string") {

            el.innerHTML = footer;

        } else {

            el.replaceChildren(footer);

        }

    }

}

/* ======================================================
   VARIANT
====================================================== */

export function setCardVariant(

    card,

    variant = "glass"

) {

    CARD_VARIANTS.forEach(cls =>

        card.classList.remove(cls)

    );

    card.classList.add(`card-${variant}`);

}

/* ======================================================
   SIZE
====================================================== */

export function setCardSize(

    card,

    size = "md"

) {

    CARD_SIZES.forEach(cls =>

        card.classList.remove(cls)

    );

    card.classList.add(`card-${size}`);

}

/* ======================================================
   COLLAPSE
====================================================== */

export function collapseCard(card) {

    card.classList.add("collapsed");

}

export function expandCard(card) {

    card.classList.remove("collapsed");

}

export function toggleCard(card) {

    card.classList.toggle("collapsed");

}

/* ======================================================
   LOADING
====================================================== */

export function setCardLoading(

    card,

    loading = true

) {

    card.classList.toggle(

        "loading",

        loading

    );

}

/* ======================================================
   REMOVE
====================================================== */

export function removeCard(card) {

    card?.remove();

}
