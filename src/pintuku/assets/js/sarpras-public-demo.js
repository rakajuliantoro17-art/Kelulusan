/* Public Sarpras dashboard — illustrative data only. No operational data is read or written. */
(() => {
  "use strict";
  const years = {
    2026: { total: 1248, health: 82.4, attention: 96, rooms: 42, trend: [74, 76, 77, 79, 80, 82.4], condition: [["Baik", 894], ["Perlu perawatan", 258], ["Rusak", 96]], category: [["Mebel", 420], ["Elektronik", 286], ["Laboratorium", 214], ["Bangunan", 188], ["Lainnya", 140]], roomsData: [["Ruang kelas", 24], ["Laboratorium", 6], ["Kantor", 5], ["Fasilitas umum", 7]] },
    2025: { total: 1196, health: 79.8, attention: 112, rooms: 40, trend: [70, 72, 74, 76, 78, 79.8], condition: [["Baik", 836], ["Perlu perawatan", 248], ["Rusak", 112]], category: [["Mebel", 405], ["Elektronik", 274], ["Laboratorium", 202], ["Bangunan", 180], ["Lainnya", 135]], roomsData: [["Ruang kelas", 23], ["Laboratorium", 6], ["Kantor", 5], ["Fasilitas umum", 6]] },
    2024: { total: 1154, health: 76.2, attention: 137, rooms: 39, trend: [67, 68, 70, 72, 74, 76.2], condition: [["Baik", 778], ["Perlu perawatan", 239], ["Rusak", 137]], category: [["Mebel", 390], ["Elektronik", 261], ["Laboratorium", 194], ["Bangunan", 177], ["Lainnya", 132]], roomsData: [["Ruang kelas", 22], ["Laboratorium", 6], ["Kantor", 5], ["Fasilitas umum", 6]] }
  };
  const $ = (id) => document.getElementById(id);
  if (!$("spPublicKpis") || !$("spDemoYear")) return;
  let activeView = "condition";
  const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);
  const descriptions = {
    total: "Jumlah aset contoh yang dipakai untuk mengisi tampilan kartu KPI. Angka inventaris resmi belum tersedia.",
    health: "Indeks gabungan kondisi aset dalam simulasi. Rumus dan bobot resmi harus ditetapkan melalui kebijakan pengelolaan Sarpras.",
    attention: "Jumlah contoh aset berstatus perlu perawatan atau rusak. Ini bukan daftar temuan aktual.",
    rooms: "Jumlah ruang dan fasilitas contoh untuk mendemonstrasikan ringkasan master data."
  };
  function renderKpis(d) {
    const cards = [
      ["total", "Total aset simulasi", fmt(d.total), "Contoh jumlah inventaris"],
      ["health", "Indeks kondisi simulasi", d.health.toFixed(1).replace(".", ",") + "%", "Skor ilustratif kondisi aset"],
      ["attention", "Perlu penanganan", fmt(d.attention), "Perawatan + rusak (contoh)"],
      ["rooms", "Ruang & fasilitas", fmt(d.rooms), "Contoh master data ruang"]
    ];
    $("spPublicKpis").innerHTML = cards.map(([key, label, value, note]) =>
      '<button type="button" class="sp-public-kpi sp-public-kpi-button" data-kpi="' + key + '" aria-label="Detail ' + label + '">' +
      '<span>' + label + '</span><strong>' + value + '</strong><small>' + note + '</small><em>Lihat keterangan ↗</em></button>'
    ).join("");
    $("spPublicKpis").querySelectorAll("[data-kpi]").forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.kpi;
      $("spDemoDetail").innerHTML = "<strong>" + button.querySelector("span").textContent + "</strong><p>" + descriptions[key] + "</p>";
      $("spDemoDetail").scrollIntoView({ behavior: "smooth", block: "nearest" });
    }));
  }
  function renderTrend(values) {
    const width = 520, height = 150, pad = 24, min = 60, max = 90;
    const pts = values.map((v, i) => [pad + i * (width - pad * 2) / (values.length - 1), height - pad - (v - min) / (max - min) * (height - pad * 2)]);
    const poly = pts.map(p => p.join(",")).join(" ");
    const labels = ["Jan", "Mar", "Mei", "Jul", "Sep", "Des"];
    $("spDemoTrend").innerHTML = '<svg viewBox="0 0 520 170" role="img" aria-label="Tren simulasi 6 titik periode">' +
      '<line x1="24" y1="24" x2="496" y2="24" class="sp-chart-grid"/><line x1="24" y1="75" x2="496" y2="75" class="sp-chart-grid"/><line x1="24" y1="126" x2="496" y2="126" class="sp-chart-grid"/>' +
      '<polyline points="' + poly + '" class="sp-chart-line"/>' +
      pts.map((p, i) => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.5" class="sp-chart-dot"><title>' + labels[i] + ': ' + values[i].toFixed(1) + '% (simulasi)</title></circle>').join("") +
      labels.map((l, i) => '<text x="' + pts[i][0] + '" y="163" text-anchor="middle" class="sp-chart-label">' + l + '</text>').join("") +
      '</svg><div class="sp-trend-foot"><span>Awal periode <b>' + values[0].toFixed(1).replace(".", ",") + '%</b></span><span>Contoh akhir <b>' + values[5].toFixed(1).replace(".", ",") + '%</b></span></div>';
  }
  function renderBreakdown(d) {
    const data = activeView === "condition" ? d.condition : activeView === "category" ? d.category : d.roomsData;
    const title = activeView === "condition" ? "Kondisi aset" : activeView === "category" ? "Kategori aset" : "Ruang & fasilitas";
    $("spDemoBreakdownTitle").textContent = title;
    const max = Math.max(...data.map(x => x[1]));
    $("spDemoBreakdown").innerHTML = data.map(([name, value], i) =>
      '<div class="sp-demo-bar-row"><div class="sp-demo-bar-label"><span>' + name + '</span><b>' + fmt(value) + '</b></div><div class="sp-demo-bar-track"><span style="width:' + (value / max * 100).toFixed(1) + '%" class="sp-demo-bar-fill fill-' + (i % 4) + '"></span></div></div>'
    ).join("");
  }
  function render() {
    const year = $("spDemoYear").value;
    const data = years[year];
    renderKpis(data);
    renderTrend(data.trend);
    renderBreakdown(data);
    $("spDemoDetail").innerHTML = "<strong>Periode " + year + " · data simulasi</strong><p>Pilih indikator KPI atau ubah tab komposisi untuk mengeksplorasi contoh data. Seluruh angka di halaman ini bukan data resmi sekolah.</p>";
  }
  $("spDemoYear").addEventListener("change", render);
  document.querySelectorAll("[data-demo-view]").forEach(button => button.addEventListener("click", () => {
    activeView = button.dataset.demoView;
    document.querySelectorAll("[data-demo-view]").forEach(item => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    renderBreakdown(years[$("spDemoYear").value]);
  }));
  render();
})();
