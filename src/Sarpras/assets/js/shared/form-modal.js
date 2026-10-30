/*
==========================================================
SARPRASIN v2.0
MODAL FORM GENERIK
File : src/assets/js/shared/form-modal.js

openFormModal({
    title, fields, values, submitText,
    onSubmit: async (data) => { ... }   // throw Error => tampil di form
})

fields: [{ name, label, type, required, options, placeholder,
           min, step, full, disabled }]
type  : text | number | select | textarea | file (hasil: objek File atau null)
        | checks (kotak centang banyak; options:[{value,label}]; hasil: array nilai)
==========================================================
*/

import { escapeHtml } from "./admin-shell.js";

function fieldHtml(f, value) {
    const id = `f_${f.name}`;
    const req = f.required ? " required" : "";
    const dis = f.disabled ? " disabled" : "";
    const v = value ?? "";
    let input;

    if (f.type === "select") {
        const opts = [`<option value="">- pilih -</option>`]
            .concat((f.options || []).map((o) =>
                `<option value="${escapeHtml(o.value)}"${String(o.value) === String(v) ? " selected" : ""}>${escapeHtml(o.label)}</option>`
            )).join("");
        input = `<select id="${id}" name="${f.name}"${req}${dis}>${opts}</select>`;
    } else if (f.type === "checks") {
        const chosen = Array.isArray(value) ? value.map(String) : [];
        input = `<div class="check-list">` + (f.options || []).map((o) => `
            <label class="check-item">
                <input type="checkbox" name="${f.name}" value="${escapeHtml(o.value)}"${chosen.includes(String(o.value)) ? " checked" : ""}${dis}>
                <span>${escapeHtml(o.label)}</span>
            </label>`).join("") + `</div>`;
    } else if (f.type === "file") {
        const current = v ? `<small>Foto saat ini: <a href="${escapeHtml(v)}" target="_blank" rel="noopener">lihat</a> (pilih file baru untuk mengganti)</small>` : "";
        input = `<input id="${id}" name="${f.name}" type="file" accept="${escapeHtml(f.accept || "image/*")}"${dis}>${current}`;
    } else if (f.type === "textarea") {
        input = `<textarea id="${id}" name="${f.name}" rows="3" placeholder="${escapeHtml(f.placeholder || "")}"${req}${dis}>${escapeHtml(v === "" ? "" : v)}</textarea>`;
    } else {
        const extra = (f.min != null ? ` min="${f.min}"` : "") + (f.step ? ` step="${f.step}"` : "");
        input = `<input id="${id}" name="${f.name}" type="${f.type || "text"}" value="${escapeHtml(v === "" ? "" : v)}" placeholder="${escapeHtml(f.placeholder || "")}"${extra}${req}${dis}>`;
    }

    return `
        <${f.type === "checks" ? "div" : "label"} class="form-field${f.full ? " full" : ""}"${f.type === "checks" ? "" : ` for="${id}"`}>
            <span>${escapeHtml(f.label)}${f.required ? " *" : ""}</span>
            ${input}
        </${f.type === "checks" ? "div" : "label"}>`;
}

export function openFormModal({ title, fields, values = {}, submitText = "Simpan", onSubmit }) {

    const overlay = document.createElement("div");
    overlay.className = "modal-backdrop";
    overlay.innerHTML = `
        <div class="modal-box glass" role="dialog" aria-modal="true">
            <div class="modal-head">
                <h3>${escapeHtml(title)}</h3>
                <button type="button" class="modal-close" aria-label="Tutup">✕</button>
            </div>
            <form class="modal-form" novalidate>
                <div class="form-grid">
                    ${fields.map((f) => fieldHtml(f, values[f.name])).join("")}
                </div>
                <p class="form-error" hidden></p>
                <div class="modal-actions">
                    <button type="button" class="btn-ghost" data-cancel>Batal</button>
                    <button type="submit" class="btn-primary">${escapeHtml(submitText)}</button>
                </div>
            </form>
        </div>`;

    document.body.appendChild(overlay);

    const form = overlay.querySelector("form");
    const errorEl = overlay.querySelector(".form-error");
    const submitBtn = overlay.querySelector(".btn-primary");

    const close = () => {
        document.removeEventListener("keydown", onKey);
        overlay.remove();
    };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);

    overlay.querySelector(".modal-close").addEventListener("click", close);
    overlay.querySelector("[data-cancel]").addEventListener("click", close);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorEl.hidden = true;

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const data = {};
        fields.forEach((f) => {
            if (f.type === "checks") {
                data[f.name] = [...form.querySelectorAll(`input[name="${f.name}"]:checked`)].map((i) => i.value);
                return;
            }
            const el = form.elements[f.name];
            if (!el) return;
            if (f.type === "file") { data[f.name] = el.files?.[0] || null; return; }
            let val = el.value.trim();
            if (f.type === "number") val = val === "" ? null : Number(val);
            data[f.name] = val;
        });

        submitBtn.disabled = true;
        const original = submitBtn.textContent;
        submitBtn.textContent = "Menyimpan...";

        try {
            await onSubmit(data);
            close();
        } catch (error) {
            console.error(error);
            errorEl.textContent = error?.message || "Gagal menyimpan data.";
            errorEl.hidden = false;
            submitBtn.disabled = false;
            submitBtn.textContent = original;
        }
    });

    overlay.querySelector("input, select, textarea")?.focus();
    return close;
}

export function confirmDialog(message) {
    return window.confirm(message);
}
