/*
==========================================================
Sarprasin 2.0
Tabs Manager
File : src/components/ui/tabs/tabs.js
Version : 2.0.0
==========================================================
*/

const tabGroups = new WeakMap();

/* ======================================================
   INIT
====================================================== */

export function initTabs(container = document) {

    const groups = container.querySelectorAll("[data-tabs]");

    groups.forEach(createTabs);

}

/* ======================================================
   CREATE
====================================================== */

function createTabs(group) {

    if (tabGroups.has(group)) return;

    const tabs = [...group.querySelectorAll('[role="tab"]')];

    const panels = [...group.querySelectorAll('[role="tabpanel"]')];

    const state = {

        tabs,

        panels,

        active:

            tabs.findIndex(

                tab =>

                    tab.classList.contains("active")

            )

    };

    if (state.active < 0) {

        state.active = 0;

    }

    tabs.forEach((tab, index) => {

        tab.addEventListener("click", () => {

            activateTab(group, index);

        });

        tab.addEventListener("keydown", event => {

            handleKeyboard(

                event,

                group,

                index

            );

        });

    });

    tabGroups.set(group, state);

    activateTab(group, state.active);

}

/* ======================================================
   ACTIVATE
====================================================== */

export function activateTab(

    group,

    tab

) {

    const state =

        typeof group === "string"

            ? tabGroups.get(

                document.querySelector(group)

            )

            : tabGroups.get(group);

    const root =

        typeof group === "string"

            ? document.querySelector(group)

            : group;

    if (!state || !root) return;

    let index = tab;

    if (typeof tab === "string") {

        index = state.tabs.findIndex(

            item =>

                item.dataset.tab === tab

        );

    }

    if (

        index < 0 ||

        index >= state.tabs.length

    ) {

        return;

    }

    state.tabs.forEach((button, i) => {

        const active = i === index;

        button.classList.toggle(

            "active",

            active

        );

        button.setAttribute(

            "aria-selected",

            active

        );

        button.tabIndex = active ? 0 : -1;

    });

    state.panels.forEach((panel, i) => {

        const active = i === index;

        panel.classList.toggle(

            "active",

            active

        );

        panel.hidden = !active;

    });

    state.active = index;

    state.tabs[index].focus();

    root.dispatchEvent(

        new CustomEvent(

            "tabchange",

            {

                detail: {

                    index,

                    id:

                        state.tabs[index]

                        .dataset.tab

                }

            }

        )

    );

}

/* ======================================================
   KEYBOARD
====================================================== */

function handleKeyboard(

    event,

    group,

    index

) {

    const state =

        tabGroups.get(group);

    if (!state) return;

    switch (event.key) {

        case "ArrowRight":

            event.preventDefault();

            nextTab(group);

            break;

        case "ArrowLeft":

            event.preventDefault();

            previousTab(group);

            break;

        case "Home":

            event.preventDefault();

            activateTab(group, 0);

            break;

        case "End":

            event.preventDefault();

            activateTab(

                group,

                state.tabs.length - 1

            );

            break;

    }

}

/* ======================================================
   NEXT
====================================================== */

export function nextTab(group) {

    const state =

        tabGroups.get(group);

    if (!state) return;

    activateTab(

        group,

        (state.active + 1)

        % state.tabs.length

    );

}

/* ======================================================
   PREVIOUS
====================================================== */

export function previousTab(group) {

    const state =

        tabGroups.get(group);

    if (!state) return;

    activateTab(

        group,

        (state.active - 1 + state.tabs.length)

        % state.tabs.length

    );

}

/* ======================================================
   GET ACTIVE
====================================================== */

export function getActiveTab(group) {

    const state =

        tabGroups.get(group);

    if (!state) return null;

    return {

        index:

            state.active,

        id:

            state.tabs[state.active]

            .dataset.tab,

        element:

            state.tabs[state.active]

    };

}

/* ======================================================
   DESTROY
====================================================== */

export function destroyTabs(group) {

    if (

        tabGroups.has(group)

    ) {

        tabGroups.delete(group);

    }

}

/* ======================================================
   AUTO INIT
====================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        initTabs();

    }

);

/* ======================================================
   EXPORT
====================================================== */

export default {

    initTabs,

    activateTab,

    nextTab,

    previousTab,

    getActiveTab,

    destroyTabs

};
