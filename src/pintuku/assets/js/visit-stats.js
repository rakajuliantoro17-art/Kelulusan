(() => {
  "use strict";

  /*
   * Statistik kunjungan modul PINTUKU.
   * Membaca penghitung yang sama dengan panel statistik Akademik/Kesiswaan:
   * GET -> { success, configured, data: { total, perPage, labels } }.
   * Hanya data nyata dari endpoint; tidak ada angka contoh. Sarpras belum
   * memiliki penghitung, jadi menampilkan keterangan "belum tersedia".
   */
  const ENDPOINTS = {
    akademik: "/api/akademik?op=stats",
    kesiswaan: "/api/kesiswaan?op=stats",
    sarpras: null
  };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nf = (n) => Math.round(n).toLocaleString("id-ID");

  const el = (tag, attrs, kids) => {
    const n = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v == null || v === false) return;
      if (k === "text") n.textContent = v; else n.setAttribute(k, v === true ? "" : v);
    });
    (kids || []).forEach((c) => c && n.appendChild(c));
    return n;
  };

  const countUp = (node, to) => {
    if (reduced || to === 0) { node.textContent = nf(to); return; }
    const t0 = performance.now(), dur = 700;
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      node.textContent = nf(to * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Hasil: { state: "ok"|"off"|"na"|"error", data? }
  const load = async (id) => {
    const url = ENDPOINTS[id];
    if (!url) return { state: "na" };
    try {
      const r = await fetch(url, { cache: "no-store" });
      const j = await r.json();
      if (j && j.configured === false) return { state: "off" };
      if (!r.ok || !j || !j.success || !j.data) return { state: "error" };
      const { total, perPage, labels } = j.data;
      const rows = Object.keys(labels || {}).map((k, i) => ({
        key: k, label: labels[k], value: Number((perPage || {})[k]) || 0, order: i
      }));
      return { state: "ok", data: { total: Number(total) || 0, rows } };
    } catch (_) {
      return { state: "error" };
    }
  };

  const MESSAGES = {
    off: "Statistik kunjungan belum diaktifkan di server.",
    na: "Penghitung kunjungan belum tersedia untuk modul ini.",
    error: "Statistik kunjungan belum dapat dimuat saat ini."
  };
  const message = (state) => el("p", { class: "vs-empty", role: "status", text: MESSAGES[state] });

  const bar = (row, max, total) => {
    const pct = max ? Math.max(row.value ? 3 : 0, (row.value / max) * 100) : 0;
    const share = total ? Math.round((row.value / total) * 100) : 0;
    const fill = el("span", { class: "vs-fill" });
    fill.style.width = reduced ? pct + "%" : "0%";
    if (!reduced) requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = pct + "%"; }));
    return el("li", { class: "vs-row" }, [
      el("div", { class: "vs-row-top" }, [
        el("span", { class: "vs-name", text: row.label }),
        el("span", { class: "vs-val", text: nf(row.value) + (total ? " · " + share + "%" : "") })
      ]),
      el("span", { class: "vs-track", "aria-hidden": "true" }, [fill])
    ]);
  };

  const renderCompact = (root, res) => {
    root.textContent = "";
    root.classList.add("vs", "vs-mini");
    if (res.state !== "ok") { root.appendChild(message(res.state)); return; }
    const { total, rows } = res.data;
    const totalEl = el("strong", { class: "vs-total-n", text: "0" });
    root.appendChild(el("div", { class: "vs-total" }, [totalEl, el("span", { text: "total kunjungan" })]));
    countUp(totalEl, total);
    const top = rows.slice().sort((a, b) => b.value - a.value).slice(0, 3);
    const max = top.length ? top[0].value : 0;
    const list = el("ul", { class: "vs-list" });
    top.forEach((r) => list.appendChild(bar(r, max, total)));
    root.appendChild(list);
  };

  const renderFull = (root, res, id) => {
    root.textContent = "";
    root.classList.add("vs", "vs-full");
    if (res.state !== "ok") { root.appendChild(message(res.state)); return; }
    const { total, rows } = res.data;
    const state = { sort: "top" };
    const totalEl = el("strong", { class: "vs-big", text: "0" });
    const seg = el("div", { class: "vs-seg", role: "group", "aria-label": "Urutan halaman" });
    const refresh = el("button", { type: "button", class: "vs-refresh", text: "Segarkan" });
    const list = el("ul", { class: "vs-list" });
    const active = rows.filter((r) => r.value > 0).length;

    root.append(
      el("div", { class: "vs-top" }, [
        el("div", {}, [
          el("div", { class: "vs-big-label", text: "Total kunjungan" }),
          el("div", { class: "vs-bigrow" }, [totalEl]),
          el("p", { class: "vs-meta", text: active + " dari " + rows.length + " halaman sudah tercatat. Dihitung satu kali per halaman untuk setiap sesi tab." })
        ]),
        el("div", { class: "vs-tools" }, [seg, refresh])
      ]),
      list
    );
    countUp(totalEl, total);

    const draw = () => {
      seg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.sort === state.sort)));
      const sorted = rows.slice().sort(state.sort === "top" ? (a, b) => b.value - a.value || a.order - b.order : (a, b) => a.order - b.order);
      const max = Math.max(0, ...rows.map((r) => r.value));
      list.textContent = "";
      sorted.forEach((r) => list.appendChild(bar(r, max, total)));
    };
    [["top", "Terbanyak"], ["menu", "Urut menu"]].forEach(([k, t]) => {
      const b = el("button", { type: "button", "data-sort": k, text: t, "aria-pressed": "false" });
      b.addEventListener("click", () => { state.sort = k; draw(); });
      seg.appendChild(b);
    });
    refresh.addEventListener("click", async () => {
      refresh.disabled = true; refresh.textContent = "Memuat…";
      const next = await load(id);
      if (next.state === "ok") renderFull(root, next, id);
      else { refresh.disabled = false; refresh.textContent = "Segarkan"; }
    });
    draw();
  };

  const cache = {};
  const get = (id) => cache[id] || (cache[id] = load(id));
  document.querySelectorAll("[data-visit-stats]").forEach((root) => {
    const id = root.dataset.visitStats;
    get(id).then((res) => (root.hasAttribute("data-full") ? renderFull(root, res, id) : renderCompact(root, res)));
  });
})();
