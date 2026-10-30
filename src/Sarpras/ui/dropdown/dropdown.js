/*
==========================================================
Sarprasin 2.0
Dropdown Manager
File : src/components/ui/dropdown/dropdown.js
Version : 2.0.0
==========================================================
*/

const instances = new WeakMap();

/* ======================================================
   CREATE
====================================================== */

export function createDropdown({

    id = "",

    placeholder = "Pilih...",

    items = [],

    searchable = false,

    multiple = false,

    onChange = null

} = {}) {

    const root = document.createElement("div");

    root.className = "dropdown";

    if (id) {

        root.id = id;

    }

    root.innerHTML = `
        <button
            type="button"
            class="dropdown-toggle"
            aria-haspopup="listbox"
            aria-expanded="false">

            <span class="dropdown-label">

                ${placeholder}

            </span>

            <span class="dropdown-arrow">

                ▼

            </span>

        </button>

        <div
            class="dropdown-menu"
            hidden>

            ${searchable ? `
            <div class="dropdown-search">
                <input
                    type="search"
                    class="dropdown-search-input"
                    placeholder="Cari...">
            </div>
            ` : ""}

            <ul
                class="dropdown-list"
                role="listbox">
            </ul>

            <div
                class="dropdown-empty hidden">

                Tidak ada data

            </div>

        </div>
    `;

    initDropdown(

        root,

        {

            items,

            multiple,

            onChange

        }

    );

    return root;

}

/* ======================================================
   INITIALIZE
====================================================== */

export function initDropdown(

    dropdown,

    {

        items = [],

        multiple = false,

        onChange = null

    } = {}

) {

    const toggle = dropdown.querySelector(".dropdown-toggle");
    const menu = dropdown.querySelector(".dropdown-menu");
    const label = dropdown.querySelector(".dropdown-label");
    const list = dropdown.querySelector(".dropdown-list");
    const search = dropdown.querySelector(".dropdown-search-input");

    const state = {

        items,

        multiple,

        selected: multiple ? [] : null,

        onChange

    };

    instances.set(

        dropdown,

        state

    );

    renderItems(

        dropdown,

        items

    );

    toggle.addEventListener(

        "click",

        () => toggleDropdown(dropdown)

    );

    if (search) {

        search.addEventListener(

            "input",

            e => {

                filterItems(

                    dropdown,

                    e.target.value

                );

            }

        );

    }

    list.addEventListener(

        "click",

        e => {

            const item = e.target.closest(".dropdown-item");

            if (!item) return;

            selectItem(

                dropdown,

                item.dataset.value

            );

        }

    );

    document.addEventListener(

        "click",

        e => {

            if (!dropdown.contains(e.target)) {

                closeDropdown(dropdown);

            }

        }

    );

}

/* ======================================================
   RENDER
====================================================== */

export function renderItems(

    dropdown,

    items = []

) {

    const list = dropdown.querySelector(".dropdown-list");
    const empty = dropdown.querySelector(".dropdown-empty");

    list.innerHTML = "";

    if (!items.length) {

        empty.classList.remove("hidden");

        return;

    }

    empty.classList.add("hidden");

    items.forEach(item => {

        const li = document.createElement("li");

        li.className = "dropdown-item";

        li.role = "option";

        li.dataset.value = item.value;

        li.textContent = item.label;

        list.append(li);

    });

}

/* ======================================================
   OPEN
====================================================== */

export function openDropdown(dropdown) {

    dropdown
        .querySelector(".dropdown-menu")
        .hidden = false;

    dropdown
        .querySelector(".dropdown-toggle")
        .setAttribute(

            "aria-expanded",

            "true"

        );

}

/* ======================================================
   CLOSE
====================================================== */

export function closeDropdown(dropdown) {

    dropdown
        .querySelector(".dropdown-menu")
        .hidden = true;

    dropdown
        .querySelector(".dropdown-toggle")
        .setAttribute(

            "aria-expanded",

            "false"

        );

}

/* ======================================================
   TOGGLE
====================================================== */

export function toggleDropdown(dropdown) {

    const menu = dropdown.querySelector(".dropdown-menu");

    if (menu.hidden) {

        openDropdown(dropdown);

    } else {

        closeDropdown(dropdown);

    }

}

/* ======================================================
   SELECT
====================================================== */

export function selectItem(

    dropdown,

    value

) {

    const state = instances.get(dropdown);

    if (!state) return;

    const item = state.items.find(

        x => String(x.value) === String(value)

    );

    if (!item) return;

    if (state.multiple) {

        const exists = state.selected.includes(value);

        state.selected = exists

            ? state.selected.filter(v => v !== value)

            : [...state.selected, value];

    } else {

        state.selected = value;

        dropdown.querySelector(

            ".dropdown-label"

        ).textContent = item.label;

        closeDropdown(dropdown);

    }

    dropdown

        .querySelectorAll(".dropdown-item")

        .forEach(el => {

            el.classList.toggle(

                "active",

                state.multiple

                    ? state.selected.includes(el.dataset.value)

                    : el.dataset.value === String(value)

            );

        });

    if (typeof state.onChange === "function") {

        state.onChange(

            getSelected(dropdown)

        );

    }

}

/* ======================================================
   FILTER
====================================================== */

export function filterItems(

    dropdown,

    keyword = ""

) {

    const lower = keyword.toLowerCase();

    dropdown

        .querySelectorAll(".dropdown-item")

        .forEach(item => {

            item.hidden = !item.textContent

                .toLowerCase()

                .includes(lower);

        });

}

/* ======================================================
   UPDATE ITEMS
====================================================== */

export function setDropdownItems(

    dropdown,

    items

) {

    const state = instances.get(dropdown);

    if (!state) return;

    state.items = items;

    renderItems(

        dropdown,

        items

    );

}

/* ======================================================
   GET SELECTED
====================================================== */

export function getSelected(dropdown) {

    const state = instances.get(dropdown);

    return state?.selected ?? null;

}

/* ======================================================
   RESET
====================================================== */

export function resetDropdown(dropdown) {

    const state = instances.get(dropdown);

    if (!state) return;

    state.selected = state.multiple ? [] : null;

    dropdown.querySelector(

        ".dropdown-label"

    ).textContent = "Pilih...";

    dropdown

        .querySelectorAll(".dropdown-item")

        .forEach(item =>

            item.classList.remove("active")

        );

}

/* ======================================================
   DESTROY
====================================================== */

export function destroyDropdown(dropdown) {

    instances.delete(dropdown);

    dropdown.remove();

}
