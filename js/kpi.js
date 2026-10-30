(() => {
  "use strict";

  /*
   * KPI modul PINTUKU.
   * Satu-satunya titik pengambilan data: loadModule(). Saat endpoint asli siap,
   * ganti isi fungsi ini (jangan komponen tampilannya). Selama `sample: true`,
   * setiap tampilan menampilkan label "Data contoh".
   */
  const DATA_URL = (id) => "/data/kpi/" + encodeURIComponent(id) + ".json";
  const PERIODS = [
    { id: "7", label: "7 hari" },
    { id: "30", label: "30 hari" },
    { id: "sem", label: "Semester" }
  ];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  let uid = 0;

  const el = (tag, attrs, children) => {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v === false || v == null) return;
      if (k === "text") node.textContent = v; else node.setAttribute(k, v === true ? "" : v);
    });
    (children || []).forEach((c) => c && node.appendChild(c));
    return node;
  };
  const svg = (tag, attrs) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => node.setAttribute(k, v));
    return node;
  };

  const fmt = (value, kpi) => {
    const d = kpi.decimals || 0;
    return value.toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d }) + (kpi.unit || "");
  };

  const deltaInfo = (kpi, p) => {
    const delta = p.delta;
    const up = delta > 0;
    const zero = delta === 0;
    const good = zero ? null : (kpi.goodWhen === "down" ? !up : up);
    const unit = kpi.unit === "%" ? " pp" : "%";
    const text = (zero ? "• " : up ? "▲ " : "▼ ") +
      Math.abs(delta).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + unit;
    return { text, cls: good === null ? "flat" : good ? "good" : "bad",
      sr: (zero ? "tidak berubah" : (up ? "naik " : "turun ") + Math.abs(delta) + unit) + " dari periode sebelumnya" };
  };

  const countUp = (node, from, to, kpi, ms) => {
    if (reduced || ms <= 0 || from === to) { node.textContent = fmt(to, kpi); return; }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      node.textContent = fmt(from + (to - from) * eased, kpi);
      if (t < 1) node._raf = requestAnimationFrame(step);
    };
    cancelAnimationFrame(node._raf);
    node._raf = requestAnimationFrame(step);
  };

  const sparkline = (series) => {
    const w = 100, h = 28, pad = 2;
    const min = Math.min(...series), max = Math.max(...series);
    const span = max - min || 1;
    const pts = series.map((v, i) => [
      pad + (i / (series.length - 1)) * (w - pad * 2),
      h - pad - ((v - min) / span) * (h - pad * 2)
    ]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const node = svg("svg", { viewBox: "0 0 " + w + " " + h, preserveAspectRatio: "none", class: "kpi-spark", "aria-hidden": "true", focusable: "false" });
    node.appendChild(svg("path", { d: line + " L" + (w - pad) + " " + h + " L" + pad + " " + h + " Z", class: "kpi-spark-area" }));
    node.appendChild(svg("path", { d: line, class: "kpi-spark-line", "vector-effect": "non-scaling-stroke" }));
    return node;
  };

  const badge = (data) => data.sample
    ? el("span", { class: "kpi-badge", title: data.sampleNote, text: "Data contoh" })
    : null;

  const segmented = (state, onChange, label) => {
    const wrap = el("div", { class: "kpi-seg", role: "group", "aria-label": label });
    PERIODS.forEach((p) => {
      const b = el("button", { type: "button", "data-period": p.id, "aria-pressed": String(state.period === p.id), text: p.label });
      b.addEventListener("click", () => { state.period = p.id; onChange(); });
      wrap.appendChild(b);
    });
    return wrap;
  };
  const syncSeg = (root, state) => root.querySelectorAll("[data-period]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.period === state.period)));

  /* ---------- Ringkasan di kartu modul (beranda) ---------- */
  const renderCompact = (root, data) => {
    const state = { period: "7", focus: 0, prev: {} };
    root.textContent = "";
    root.classList.add("kpi-mini");
    const tiles = el("div", { class: "kpi-tiles" });
    const hint = el("p", { class: "kpi-hint", "aria-live": "polite" });
    const head = el("div", { class: "kpi-head" }, [segmented(state, update, "Periode KPI " + data.title), badge(data)]);
    root.append(head, tiles, hint);

    const buttons = data.kpis.map((kpi, i) => {
      const v = el("strong", { class: "kpi-v" });
      const d = el("span", { class: "kpi-d" });
      const b = el("button", { type: "button", class: "kpi-tile", "aria-pressed": String(i === 0) }, [
        el("span", { class: "kpi-l", text: kpi.label }), v, d, el("span", { class: "kpi-spark-slot" })
      ]);
      b.addEventListener("click", () => { state.focus = i; update(true); });
      tiles.appendChild(b);
      return { b, v, d, kpi };
    });

    function update(skipAnim) {
      syncSeg(root, state);
      buttons.forEach(({ b, v, d, kpi }, i) => {
        const p = kpi.periods[state.period];
        const info = deltaInfo(kpi, p);
        countUp(v, state.prev[kpi.id] == null ? 0 : state.prev[kpi.id], p.value, kpi, skipAnim === true ? 0 : 550);
        state.prev[kpi.id] = p.value;
        d.className = "kpi-d " + info.cls;
        d.textContent = info.text;
        d.setAttribute("aria-label", info.sr);
        const slot = b.querySelector(".kpi-spark-slot");
        slot.textContent = ""; slot.appendChild(sparkline(p.series));
        b.setAttribute("aria-pressed", String(i === state.focus));
      });
      const f = data.kpis[state.focus];
      hint.textContent = f.label + ": " + f.hint;
    }
    update();
  };

  /* ---------- Dashboard penuh (halaman modul) ---------- */
  const renderFull = (root, data) => {
    const state = { period: "7", focus: 0, prev: {}, idx: null };
    const id = "kpi" + (++uid);
    root.textContent = "";
    root.classList.add("kpi-full");

    const note = data.sample ? el("p", { class: "kpi-note", role: "note", text: data.sampleNote }) : null;
    const head = el("div", { class: "kpi-head" }, [segmented(state, update, "Periode KPI " + data.title), badge(data)]);
    const tabs = el("div", { class: "kpi-tabs", role: "tablist", "aria-label": "Pilih indikator" });
    const chartCard = el("div", { class: "kpi-chart-card", role: "tabpanel", id: id + "-panel" });
    root.append(head, note, tabs, chartCard);

    const tabNodes = data.kpis.map((kpi, i) => {
      const v = el("strong", { class: "kpi-v" });
      const d = el("span", { class: "kpi-d" });
      const b = el("button", { type: "button", class: "kpi-tile", role: "tab", id: id + "-t" + i, "aria-controls": id + "-panel", "aria-selected": String(i === 0), tabindex: i === 0 ? "0" : "-1" }, [
        el("span", { class: "kpi-l", text: kpi.label }), v, d, el("span", { class: "kpi-spark-slot" })
      ]);
      b.addEventListener("click", () => { state.focus = i; state.idx = null; update(true); });
      b.addEventListener("keydown", (e) => {
        const n = data.kpis.length;
        let next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = n - 1;
        if (next === null) return;
        e.preventDefault();
        state.focus = next; state.idx = null; update(true);
        tabNodes[next].b.focus();
      });
      tabs.appendChild(b);
      return { b, v, d, kpi };
    });

    const title = el("h3", { class: "kpi-chart-title" });
    const big = el("strong", { class: "kpi-big" });
    const bigD = el("span", { class: "kpi-d" });
    const stats = el("dl", { class: "kpi-stats" });
    const plot = el("div", { class: "kpi-plot", tabindex: "0", role: "img" });
    const tip = el("div", { class: "kpi-tip", hidden: true, "aria-hidden": "true" });
    const hintP = el("p", { class: "kpi-hint", "aria-live": "polite" });
    const sr = el("p", { class: "sr-only", "aria-live": "polite" });
    chartCard.append(
      el("div", { class: "kpi-chart-top" }, [el("div", {}, [title, el("div", { class: "kpi-bigrow" }, [big, bigD])]), stats]),
      plot, hintP, sr
    );
    plot.appendChild(tip);

    function drawChart(kpi, p, labels) {
      plot.querySelectorAll("svg").forEach((n) => n.remove());
      const W = Math.max(300, Math.round(plot.clientWidth)), H = W < 520 ? 200 : 250, L = 14, R = 14, T = 16, B = 30;
      const s = p.series;
      const min = Math.min(...s), max = Math.max(...s);
      const lo = min - (max - min) * 0.25, hi = max + (max - min) * 0.18 || max + 1;
      const x = (i) => L + (i / (s.length - 1)) * (W - L - R);
      const y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
      const g = svg("svg", { viewBox: "0 0 " + W + " " + H, class: "kpi-svg", "aria-hidden": "true", focusable: "false" });
      for (let k = 0; k < 4; k++) {
        const gy = T + (k / 3) * (H - T - B);
        g.appendChild(svg("line", { x1: L, x2: W - R, y1: gy, y2: gy, class: "kpi-grid" }));
      }
      const line = s.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join(" ");
      g.appendChild(svg("path", { d: line + " L" + x(s.length - 1) + " " + (H - B) + " L" + x(0) + " " + (H - B) + " Z", class: "kpi-area" }));
      g.appendChild(svg("path", { d: line, class: "kpi-line" }));
      s.forEach((v, i) => g.appendChild(svg("circle", { cx: x(i), cy: y(v), r: 3.2, class: "kpi-dot", "data-i": i })));
      const every = s.length > 8 ? (W < 520 ? 3 : 2) : 1;
      const lastI = labels.length - 1;
      labels.forEach((t, i) => {
        if (i !== lastI && (i % every || lastI - i < every)) return;
        const tx = svg("text", { x: x(i), y: H - 9, class: "kpi-axis", "text-anchor": i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle" });
        tx.textContent = t; g.appendChild(tx);
      });
      const cursor = svg("line", { y1: T, y2: H - B, class: "kpi-cursor", visibility: "hidden" });
      g.appendChild(cursor);
      plot.appendChild(g);

      const show = (i) => {
        state.idx = i;
        const cx = x(i) / W;
        cursor.setAttribute("x1", x(i)); cursor.setAttribute("x2", x(i)); cursor.setAttribute("visibility", "visible");
        g.querySelectorAll(".kpi-dot").forEach((c) => c.classList.toggle("on", Number(c.dataset.i) === i));
        tip.hidden = false;
        tip.textContent = labels[i] + " · " + fmt(s[i], kpi);
        tip.style.left = Math.min(Math.max(cx * 100, 12), 88) + "%";
        sr.textContent = labels[i] + ": " + fmt(s[i], kpi);
      };
      const hide = () => {
        state.idx = null; tip.hidden = true; cursor.setAttribute("visibility", "hidden");
        g.querySelectorAll(".kpi-dot").forEach((c) => c.classList.remove("on"));
      };
      const nearest = (clientX) => {
        const r = g.getBoundingClientRect();
        const rel = ((clientX - r.left) / r.width) * W;
        return Math.max(0, Math.min(s.length - 1, Math.round(((rel - L) / (W - L - R)) * (s.length - 1))));
      };
      plot.onpointermove = (e) => show(nearest(e.clientX));
      plot.onpointerdown = (e) => show(nearest(e.clientX));
      plot.onpointerleave = (e) => { if (e.pointerType === "mouse") hide(); };
      plot.onkeydown = (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          const cur = state.idx == null ? s.length - 1 : state.idx;
          show(Math.max(0, Math.min(s.length - 1, cur + (e.key === "ArrowRight" ? 1 : -1))));
        }
        if (e.key === "Escape") hide();
      };
      plot.onblur = hide;
    }

    function update(skipAnim) {
      syncSeg(root, state);
      tabNodes.forEach(({ b, v, d, kpi }, i) => {
        const p = kpi.periods[state.period];
        const info = deltaInfo(kpi, p);
        countUp(v, state.prev[kpi.id] == null ? 0 : state.prev[kpi.id], p.value, kpi, skipAnim === true ? 0 : 550);
        state.prev[kpi.id] = p.value;
        d.className = "kpi-d " + info.cls; d.textContent = info.text; d.setAttribute("aria-label", info.sr);
        const slot = b.querySelector(".kpi-spark-slot");
        slot.textContent = ""; slot.appendChild(sparkline(p.series));
        b.setAttribute("aria-selected", String(i === state.focus));
        b.setAttribute("tabindex", i === state.focus ? "0" : "-1");
      });
      const kpi = data.kpis[state.focus];
      const p = kpi.periods[state.period];
      const info = deltaInfo(kpi, p);
      const per = PERIODS.find((x) => x.id === state.period).label;
      chartCard.setAttribute("aria-labelledby", id + "-t" + state.focus);
      title.textContent = kpi.label + " · " + per;
      big.textContent = fmt(p.value, kpi);
      bigD.className = "kpi-d " + info.cls; bigD.textContent = info.text; bigD.setAttribute("aria-label", info.sr);
      const avg = p.series.reduce((a, b) => a + b, 0) / p.series.length;
      stats.textContent = "";
      [["Tertinggi", Math.max(...p.series)], ["Rata-rata", avg], ["Terendah", Math.min(...p.series)]].forEach(([k, val]) =>
        stats.appendChild(el("div", {}, [el("dt", { text: k }), el("dd", { text: fmt(val, kpi) })])));
      hintP.textContent = kpi.hint;
      plot.setAttribute("aria-label", "Grafik " + kpi.label + ", " + per + ". Gunakan panah kiri/kanan untuk membaca nilai tiap titik.");
      redraw = () => drawChart(kpi, p, data.periodLabels[state.period]);
      redraw();
    }
    let redraw = () => {};
    let lastW = 0, rafId = 0;
    if ("ResizeObserver" in window) {
      new ResizeObserver(() => {
        const w = Math.round(plot.clientWidth);
        if (!w || w === lastW) return;
        lastW = w; cancelAnimationFrame(rafId); rafId = requestAnimationFrame(() => redraw());
      }).observe(plot);
    }
    update();
  };

  /* ---------- Panel teks (perhatian / aktivitas) ---------- */
  const renderList = (root, data) => {
    const kind = root.dataset.kpiList;
    const items = data[kind] || [];
    root.textContent = "";
    items.forEach((it) => {
      if (kind === "attention") {
        const tag = it.level === "warn" ? "Perhatian" : "Info";
        root.appendChild(el("li", { class: "kpi-li " + it.level }, [el("span", { class: "kpi-tag", text: tag }), el("span", { text: it.text })]));
      } else {
        root.appendChild(el("li", { class: "kpi-li" }, [el("span", { class: "kpi-when", text: it.when }), el("span", { text: it.text })]));
      }
    });
    if (data.sample && kind === "activity") root.appendChild(el("li", { class: "kpi-li kpi-li-note", text: "Contoh aktivitas, bukan catatan sebenarnya." }));
  };

  const cache = {};
  const loadModule = (id) => cache[id] || (cache[id] = fetch(DATA_URL(id), { cache: "no-cache" }).then((r) => {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }));

  const mounts = document.querySelectorAll("[data-kpi-compact],[data-kpi-dashboard],[data-kpi-list]");
  mounts.forEach((root) => {
    const id = root.dataset.kpiCompact || root.dataset.kpiDashboard || root.dataset.kpiModule;
    loadModule(id).then((data) => {
      if (root.hasAttribute("data-kpi-compact")) renderCompact(root, data);
      else if (root.hasAttribute("data-kpi-dashboard")) renderFull(root, data);
      else renderList(root, data);
    }).catch(() => {
      root.textContent = "";
      root.appendChild(el("p", { class: "kpi-hint", role: "status", text: "Indikator belum dapat dimuat saat ini." }));
    });
  });
})();
