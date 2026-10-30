/*
==========================================================
Sarprasin 2.0
Loader Manager
File : src/components/ui/loaders/loader.js
Version : 2.0.0
==========================================================
*/

const state = {

    overlay: null,

    progress: null,

    message: null,

    initialized: false

};

/* ======================================================
   INIT
====================================================== */

export function initLoader() {

    if (state.initialized) return;

    state.overlay = document.getElementById("loadingContainer")
        || document.getElementById("appLoader")
        || document.querySelector(".loader-overlay");

    if (!state.overlay) {

        console.warn("Loader overlay tidak ditemukan.");

        return;

    }

    state.progress = state.overlay.querySelector(".progress-fill");

    state.message = state.overlay.querySelector(".loader-message");

    state.initialized = true;

}

/* ======================================================
   SHOW
====================================================== */

export function showLoader(

    message = "Memuat data..."

) {

    initLoader();

    if (!state.overlay) return;

    state.overlay.hidden = false;

    state.overlay.classList.add("show");

    state.overlay.setAttribute(

        "aria-busy",

        "true"

    );

    setLoaderMessage(message);

}

/* ======================================================
   HIDE
====================================================== */

export function hideLoader() {

    if (!state.overlay) return;

    state.overlay.classList.remove("show");

    state.overlay.hidden = true;

    state.overlay.setAttribute(

        "aria-busy",

        "false"

    );

}

/* ======================================================
   MESSAGE
====================================================== */

export function setLoaderMessage(

    message

) {

    if (

        state.message

    ) {

        state.message.textContent = message;

    }

}

/* ======================================================
   PROGRESS
====================================================== */

export function setLoaderProgress(

    percent = 0

) {

    percent = Math.max(

        0,

        Math.min(

            100,

            percent

        )

    );

    if (

        state.progress

    ) {

        state.progress.style.width =

            `${percent}%`;

    }

    const label =

        state.overlay?.querySelector(

            ".loader-progress"

        );

    if (label) {

        label.textContent =

            `${percent}%`;

    }

}

/* ======================================================
   BUTTON LOADER
====================================================== */

export function setButtonLoading(

    button,

    loading = true,

    text = "Memproses..."

) {

    if (!button) return;

    if (loading) {

        button.dataset.originalText =

            button.innerHTML;

        button.disabled = true;

        button.innerHTML = `

            <span class="btn-spinner"></span>

            ${text}

        `;

    }

    else {

        button.disabled = false;

        button.innerHTML =

            button.dataset.originalText ||

            "Submit";

    }

}

/* ======================================================
   SKELETON
====================================================== */

export function createSkeleton({

    rows = 5,

    className = ""

} = {}) {

    const wrapper = document.createElement("div");

    wrapper.className =

        `skeleton-wrapper ${className}`;

    for (

        let i = 0;

        i < rows;

        i++

    ) {

        const row =

            document.createElement("div");

        row.className =

            "skeleton-row";

        wrapper.append(row);

    }

    return wrapper;

}

/* ======================================================
   REPLACE SKELETON
====================================================== */

export function removeSkeleton(

    skeleton

) {

    if (

        skeleton?.parentNode

    ) {

        skeleton.remove();

    }

}

/* ======================================================
   PAGE LOADER
====================================================== */

export async function withLoader(

    callback,

    message = "Memuat..."

) {

    showLoader(message);

    try {

        return await callback();

    }

    finally {

        hideLoader();

    }

}

/* ======================================================
   DELAY
====================================================== */

export function delay(

    ms = 500

) {

    return new Promise(

        resolve =>

            setTimeout(

                resolve,

                ms

            )

    );

}

/* ======================================================
   FILE UPLOAD PROGRESS
====================================================== */

export async function simulateProgress(

    speed = 20

) {

    showLoader("Mengunggah file...");

    for (

        let i = 0;

        i <= 100;

        i++

    ) {

        setLoaderProgress(i);

        await delay(speed);

    }

    hideLoader();

}

/* ======================================================
   EXPORT
====================================================== */

export default {

    initLoader,

    showLoader,

    hideLoader,

    setLoaderMessage,

    setLoaderProgress,

    setButtonLoading,

    createSkeleton,

    removeSkeleton,

    withLoader,

    simulateProgress,

    delay

};
