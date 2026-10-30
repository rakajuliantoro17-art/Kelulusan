/*
==========================================================
Sarprasin 2.0
Form Manager
File : src/components/ui/forms/form.js
Version : 2.0.0
==========================================================
*/

const formStore = new WeakMap();

/* ======================================================
   INITIALIZE
====================================================== */

export function initForm(form, options = {}) {

    if (!(form instanceof HTMLFormElement)) {
        throw new Error("initForm() membutuhkan HTMLFormElement.");
    }

    const config = {

        validateOnInput: true,

        validateOnBlur: true,

        onSubmit: null,

        ...options

    };

    formStore.set(form, config);

    if (config.validateOnInput) {

        form.addEventListener("input", e => {

            validateField(e.target);

        });

    }

    if (config.validateOnBlur) {

        form.addEventListener("blur", e => {

            validateField(e.target);

        }, true);

    }

    form.addEventListener("submit", async e => {

        e.preventDefault();

        if (!validateForm(form)) return;

        if (typeof config.onSubmit === "function") {

            await config.onSubmit(

                getFormData(form),

                form

            );

        }

    });

}

/* ======================================================
   GET DATA
====================================================== */

export function getFormData(form) {

    const fd = new FormData(form);

    const data = {};

    for (const [key, value] of fd.entries()) {

        if (data[key] !== undefined) {

            if (!Array.isArray(data[key])) {

                data[key] = [data[key]];

            }

            data[key].push(value);

        } else {

            data[key] = value;

        }

    }

    return data;

}

/* ======================================================
   SET DATA
====================================================== */

export function setFormData(form, values = {}) {

    Object.entries(values).forEach(([key, value]) => {

        const elements = form.querySelectorAll(

            `[name="${key}"]`

        );

        elements.forEach(el => {

            switch (el.type) {

                case "checkbox":

                    if (Array.isArray(value)) {

                        el.checked = value.includes(el.value);

                    } else {

                        el.checked = Boolean(value);

                    }

                    break;

                case "radio":

                    el.checked =

                        el.value == value;

                    break;

                case "file":

                    break;

                default:

                    el.value = value ?? "";

            }

        });

    });

}

/* ======================================================
   VALIDATE FORM
====================================================== */

export function validateForm(form) {

    let valid = true;

    const fields = form.querySelectorAll(

        "input, textarea, select"

    );

    fields.forEach(field => {

        if (!validateField(field)) {

            valid = false;

        }

    });

    return valid;

}

/* ======================================================
   VALIDATE FIELD
====================================================== */

export function validateField(field) {

    if (

        !(field instanceof HTMLElement)

    ) {

        return true;

    }

    if (

        field.disabled ||

        field.type === "hidden"

    ) {

        return true;

    }

    let message = "";

    if (

        field.required &&

        !field.value.trim()

    ) {

        message = "Field wajib diisi.";

    }

    else if (

        field.type === "email" &&

        field.value

    ) {

        const regex =

            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (

            !regex.test(field.value)

        ) {

            message =

                "Format email tidak valid.";

        }

    }

    else if (

        field.minLength > 0 &&

        field.value.length < field.minLength

    ) {

        message =

            `Minimal ${field.minLength} karakter.`;

    }

    else if (

        field.maxLength > 0 &&

        field.value.length > field.maxLength

    ) {

        message =

            `Maksimal ${field.maxLength} karakter.`;

    }

    setFieldState(

        field,

        !message,

        message

    );

    return !message;

}

/* ======================================================
   FIELD STATE
====================================================== */

export function setFieldState(

    field,

    valid,

    message = ""

) {

    field.classList.toggle(

        "is-valid",

        valid

    );

    field.classList.toggle(

        "is-invalid",

        !valid

    );

    field.setAttribute(

        "aria-invalid",

        String(!valid)

    );

    const id =

        field.dataset.error;

    if (!id) return;

    const error =

        document.getElementById(id);

    if (!error) return;

    error.textContent = message;

}

/* ======================================================
   RESET
====================================================== */

export function resetForm(form) {

    form.reset();

    form.querySelectorAll(

        ".is-valid,.is-invalid"

    ).forEach(el => {

        el.classList.remove(

            "is-valid",

            "is-invalid"

        );

        el.setAttribute(

            "aria-invalid",

            "false"

        );

    });

}

/* ======================================================
   ENABLE / DISABLE
====================================================== */

export function setFormDisabled(

    form,

    disabled = true

) {

    form.querySelectorAll(

        "input,textarea,select,button"

    ).forEach(el => {

        el.disabled = disabled;

    });

}

/* ======================================================
   SERIALIZE
====================================================== */

export function serializeForm(form) {

    return JSON.stringify(

        getFormData(form)

    );

}

/* ======================================================
   LOAD JSON
====================================================== */

export function loadForm(form, json) {

    try {

        setFormData(

            form,

            JSON.parse(json)

        );

    }

    catch {

        console.error(

            "JSON form tidak valid."

        );

    }

}

/* ======================================================
   DIRTY CHECK
====================================================== */

export function isFormDirty(form) {

    const current =

        serializeForm(form);

    const original =

        form.dataset.initialData || "";

    return current !== original;

}

export function saveInitialState(form) {

    form.dataset.initialData =

        serializeForm(form);

}
