/*
==========================================================
SARPRASIN v2.0
PEMBERSIH DATA IMPOR (aturan + pencocokan mirip / fuzzy)
File : src/assets/js/shared/import-clean.js

Murni logika (tanpa DOM / Firebase) supaya bisa diuji di Node.
Alur: baris mentah dari Excel/CSV -> deteksi kolom -> bersihkan tiap
sel -> cocokkan ruangan & nama barang -> tandai masalah.

Ini BUKAN model machine learning terlatih, dan tidak memanggil AI
eksternal. Yang dipakai: kamus sinonim, aturan parsing, jarak
Levenshtein, dan pencocokan ke data yang sudah ada. Semua koreksi
otomatis dicatat di kolom catatan supaya bisa ditinjau manusia.
==========================================================
*/

/* ---------- util teks ---------- */

const str = (v) => (v === null || v === undefined ? "" : String(v)).replace(/ /g, " ").trim();

export function norm(v) {
    return str(v).toLowerCase().replace(/[^a-z0-9/ ]+/g, " ").replace(/\s+/g, " ").trim();
}

export function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        const cur = [i];
        for (let j = 1; j <= b.length; j++) {
            cur[j] = Math.min(
                prev[j] + 1,
                cur[j - 1] + 1,
                prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
        }
        prev = cur;
    }
    return prev[b.length];
}

export function similarity(a, b) {
    const x = norm(a);
    const y = norm(b);
    if (!x && !y) return 1;
    const max = Math.max(x.length, y.length);
    return max ? 1 - levenshtein(x, y) / max : 1;
}

const digitsOf = (s) => (norm(s).match(/\d+/g) || []).join(",");

const ACRONYMS = new Set([
    "ac", "pc", "lcd", "led", "cpu", "tv", "ups", "usb", "ram", "dvd", "aio", "hp",
    "lg", "msi", "uks", "bk", "osis", "ipa", "ips", "atk", "wifi", "hdmi", "vga", "lan",
    "dc", "ii", "iii", "iv", "vi", "vii", "viii", "ix", "xi", "xii", "x"
]);

function smartCase(text) {
    const t = str(text).replace(/\s+/g, " ");
    if (!t) return "";
    const letters = t.replace(/[^A-Za-z]/g, "");
    const mixed = /[a-z]/.test(letters) && /[A-Z]/.test(letters);
    if (mixed) return t;                       // sudah ditulis rapi oleh manusia
    return t.toLowerCase().split(" ").map((w) => {
        if (ACRONYMS.has(w)) return w.toUpperCase();
        return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(" ");
}

/* ---------- kamus kolom ---------- */

export const FIELD_LABEL = {
    ruangan: "Ruangan",
    namaBarang: "Nama Barang",
    merk: "Merk/Model",
    tahun: "Tahun",
    kodeResmi: "Kode Barang",
    jumlah: "Jumlah",
    kondisi: "Kondisi",
    sumberDana: "Sumber Dana",
    nilai: "Nilai",
    catatan: "Catatan"
};

const SYNONYMS = {
    ruangan: ["ruangan", "ruang", "kelas", "ruangan/kelas", "lokasi", "nama ruang", "ruang/kelas"],
    namaBarang: ["nama barang", "barang", "nama", "jenis barang", "nama barang/ jenis barang",
        "nama barang/jenis barang", "item", "nama aset", "aset"],
    merk: ["merk", "merek", "model", "merk/model", "merk model", "merek/model"],
    tahun: ["tahun", "tahun pembelian", "tahun perolehan", "thn", "tahun pengadaan", "tahun beli"],
    kodeResmi: ["no. kode barang", "no kode barang", "kode barang", "kode", "kode barang resmi", "kode resmi", "nomor kode barang"],
    jumlah: ["jumlah", "jumlah barang", "jml", "qty", "banyak", "kuantitas"],
    kondisi: ["kondisi", "kondisi barang", "status", "keterangan"],
    sumberDana: ["sumber dana", "sumber", "dana", "asal dana", "asal usul"],
    nilai: ["nilai", "harga", "harga satuan", "nilai satuan", "nilai perolehan", "harga perolehan", "nilai satuan rp"],
    catatan: ["catatan", "keterangan tambahan", "note", "catatan tambahan"]
};

function matchHeader(cell) {
    const h = norm(cell);
    if (!h) return null;
    for (const [field, list] of Object.entries(SYNONYMS)) {
        if (list.includes(h)) return { field, score: 1 };
    }
    let best = null;
    for (const [field, list] of Object.entries(SYNONYMS)) {
        for (const s of list) {
            const sc = similarity(h, s);
            if (sc >= 0.82 && (!best || sc > best.score)) best = { field, score: sc };
        }
    }
    return best;
}

/** Cari baris judul kolom dan petakan kolom -> field. */
export function detectColumns(rows) {
    const limit = Math.min(rows.length, 40);
    for (let r = 0; r < limit; r++) {
        const map = {};
        let hits = 0;
        (rows[r] || []).forEach((cell, c) => {
            const m = matchHeader(cell);
            if (m && !Object.values(map).some((x) => x.field === m.field)) {
                map[c] = m;
                hits++;
            }
        });
        const fields = Object.values(map).map((m) => m.field);
        if (hits >= 3 && fields.includes("namaBarang")) {
            // "Keterangan" dipakai sekolah untuk kondisi; bila ada kolom "Kondisi" terpisah,
            // maka "Keterangan" menjadi catatan.
            const cols = Object.entries(map);
            const kondisiCols = cols.filter(([, m]) => m.field === "kondisi");
            if (kondisiCols.length > 1) {
                const ket = kondisiCols.find(([c]) => norm(rows[r][c]) === "keterangan");
                if (ket) map[ket[0]] = { field: "catatan", score: 1 };
            }
            return { headerRow: r, map };
        }
    }
    return null;
}

/** Nama ruangan dari kop sheet gaya KIR ("RUANGAN/KELAS : LAB KOMPUTER 1"). */
export function detectRoomFromHeader(rows, headerRow) {
    for (let r = 0; r < headerRow; r++) {
        const row = rows[r] || [];
        const i = row.findIndex((c) => /^ruangan\s*\/?\s*kelas$|^ruangan$|^ruang$/i.test(str(c)));
        if (i >= 0) {
            const next = row.slice(i + 1).map(str).find(Boolean);
            if (next) return next.replace(/^:\s*/, "").trim();
        }
    }
    return "";
}

/* ---------- parser nilai ---------- */

const KATA_ANGKA = { satu: 1, dua: 2, tiga: 3, empat: 4, lima: 5, enam: 6, tujuh: 7, delapan: 8, sembilan: 9, sepuluh: 10 };

export function parseJumlah(raw) {
    const t = norm(raw);
    if (t === "") return { value: 1, notes: [{ level: "warn", text: "Jumlah kosong, dianggap 1." }] };
    if (typeof raw === "number") {
        if (!Number.isFinite(raw) || raw < 1) return { value: null, notes: [{ level: "error", text: "Jumlah harus ≥ 1." }] };
        if (!Number.isInteger(raw)) return { value: Math.round(raw), notes: [{ level: "warn", text: `Jumlah ${raw} dibulatkan.` }] };
        return { value: raw, notes: raw > 2000 ? [{ level: "warn", text: "Jumlah sangat besar, cek lagi." }] : [] };
    }
    const m = t.match(/\d+/);
    let n = m ? parseInt(m[0], 10) : KATA_ANGKA[t.split(" ")[0]];
    if (n === 0) return { value: null, notes: [{ level: "error", text: `Jumlah "${str(raw)}" harus ≥ 1.` }] };
    if (!n || n < 1) return { value: null, notes: [{ level: "error", text: `Jumlah "${str(raw)}" tidak terbaca.` }] };
    const notes = [];
    if (t !== String(n)) notes.push({ level: "info", text: `Jumlah "${str(raw)}" dibaca ${n}.` });
    if (n > 2000) notes.push({ level: "warn", text: "Jumlah sangat besar, cek lagi." });
    return { value: n, notes };
}

export function parseTahun(raw, now = new Date().getFullYear()) {
    const t = str(raw);
    if (!t) return { value: null, notes: [] };
    const years = (t.match(/(19|20)\d{2}/g) || []).map(Number);
    if (!years.length) return { value: null, notes: [{ level: "warn", text: `Tahun "${t}" tidak terbaca, dikosongkan.` }] };
    const y = years[0];
    if (y < 1970 || y > now + 1) return { value: null, notes: [{ level: "warn", text: `Tahun ${y} di luar rentang wajar, dikosongkan.` }] };
    const notes = years.length > 1 ? [{ level: "info", text: `Beberapa tahun ("${t}"), dipakai ${y}.` }] : [];
    return { value: y, notes };
}

export function parseKondisi(raw) {
    const t = norm(raw);
    if (!t) return { value: "BAIK", rest: "", notes: [{ level: "warn", text: "Kondisi kosong, dianggap Baik." }] };

    const has = (re) => re.test(` ${t} `);
    if (has(/ (rusak berat|rb|berat|hancur|afkir|tidak (bisa|dapat) (dipakai|digunakan)|mati total) /)) return { value: "RUSAK_BERAT", rest: "", notes: [] };
    if (has(/ (rusak ringan|rr|perlu perbaikan|butuh perbaikan|kurang baik|kb|perbaikan|servis|service|rusak sebagian) /)) return { value: "RUSAK_RINGAN", rest: "", notes: [] };
    if (has(/ (rusak|rsk) /)) return { value: "RUSAK_BERAT", rest: "", notes: [{ level: "warn", text: `"${str(raw)}" ambigu (ringan/berat), dianggap Rusak Berat.` }] };
    if (has(/ (baik|b|bagus|normal|layak|good|ok|oke) /)) {
        // "Baik, kaki patah" -> catatan
        const rest = t.replace(/\b(baik|bagus|normal|layak|good|ok|oke)\b/, "").replace(/\s+/g, " ").trim();
        return { value: "BAIK", rest: rest.length > 2 ? str(raw) : "", notes: [] };
    }
    // fuzzy: salah ketik ("baek", "rusak brat")
    const options = { baik: "BAIK", "rusak berat": "RUSAK_BERAT", "rusak ringan": "RUSAK_RINGAN", "perlu perbaikan": "RUSAK_RINGAN" };
    let best = null;
    for (const [k, v] of Object.entries(options)) {
        const sc = similarity(t, k);
        if (sc >= 0.75 && (!best || sc > best.sc)) best = { v, sc, k };
    }
    if (best) return { value: best.v, rest: "", notes: [{ level: "info", text: `Kondisi "${str(raw)}" dikoreksi menjadi "${best.k}".` }] };
    return { value: "BAIK", rest: str(raw), notes: [{ level: "warn", text: `Kondisi "${str(raw)}" tidak dikenali, dianggap Baik dan disimpan sebagai catatan.` }] };
}

export function parseSumberDana(raw) {
    const t = norm(raw);
    if (!t) return { value: "", notes: [] };
    const map = [
        [/\bbosp\b|\bbos\b|bos reguler|bos reg/, "BOSP"], [/\bbosk\b|bos kinerja/, "BOSK"],
        [/\bbppop\b|\bbpopp\b|\bbop\b/, "BPPOP"], [/\bapbd\b|provinsi/, "APBD"], [/\bapbn\b|pusat/, "APBN"],
        [/komite|sumbangan|wali murid|orang tua/, "KOMITE"], [/hibah|bantuan|donasi|alumni/, "HIBAH"]
    ];
    for (const [re, v] of map) if (re.test(t)) return { value: v, notes: [] };
    return { value: "LAINNYA", notes: [{ level: "warn", text: `Sumber dana "${str(raw)}" tidak dikenali, diisi Lainnya.` }] };
}

export function parseNilai(raw) {
    if (typeof raw === "number") return { value: raw >= 0 ? raw : null, notes: raw >= 0 ? [] : [{ level: "warn", text: "Nilai negatif diabaikan." }] };
    const low = str(raw).toLowerCase();
    if (!low) return { value: null, notes: [] };
    let mult = 1;
    if (/(jt|juta)\b/.test(low)) mult = 1e6;
    else if (/(rb|ribu)\b|\dk\b/.test(low)) mult = 1e3;
    let numText = low.replace(/rp\.?|juta|jt|ribu|rb|k\b/g, "").replace(/\s/g, "");
    if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(numText)) numText = numText.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(numText)) numText = numText.replace(/,/g, "");
    else numText = numText.replace(",", ".");
    const n = Number(numText);
    if (!numText || !Number.isFinite(n)) return { value: null, notes: [{ level: "warn", text: `Nilai "${str(raw)}" tidak terbaca, dikosongkan.` }] };
    const value = Math.round(n * mult);
    return { value, notes: mult !== 1 ? [{ level: "info", text: `Nilai "${str(raw)}" dibaca Rp ${value.toLocaleString("id-ID")}.` }] : [] };
}

export function parseKode(raw) {
    const t = str(raw).replace(/\s+/g, "");
    if (!t) return { value: "", notes: [] };
    if (/^0(\.0)+$/.test(t)) return { value: t, notes: [{ level: "info", text: "Kode barang placeholder (0.0.0.0.0)." }] };
    if (/^\d+(\.\d+){2,}$/.test(t)) return { value: t, notes: [] };
    return { value: str(raw), notes: [{ level: "warn", text: `Format kode "${str(raw)}" tidak lazim (contoh: 1.3.2.05.02.04.004).` }] };
}

/* ---------- kamus nama barang ---------- */

export const NAMA_UMUM = [
    "AC", "Brankas", "Dispenser", "Etalase", "Foto Presiden", "Foto Wakil Presiden", "Jam Dinding",
    "Kipas Angin", "Komputer", "Kursi Guru", "Kursi Kerja", "Kursi Siswa", "Kursi Tamu", "Kursi Tunggu",
    "Lambang Garuda", "Laptop", "Layar LCD", "LCD Proyektor", "Lemari Arsip", "Lemari Besi", "Lemari Kayu",
    "Meja Guru", "Meja Kerja", "Meja Komputer", "Meja Rapat", "Meja Siswa", "Microphone", "Papan Tulis",
    "PC All In One", "Printer", "Proyektor", "Rak Buku", "Scanner", "Smart TV", "Sound System", "Speaker",
    "Stavolt", "Stop Kontak", "Tempat Sampah", "Tensi", "Timbangan", "TV", "UPS", "Whiteboard"
];

const ALIAS = {
    "pc aio": "PC All In One", "aio": "PC All In One", "all in one": "PC All In One", "komputer aio": "PC All In One",
    "lcd": "LCD Proyektor", "infokus": "Proyektor", "in focus": "Proyektor", "projector": "Proyektor",
    "white board": "Whiteboard", "papan tulis putih": "Whiteboard", "tv led": "TV LED", "kipas": "Kipas Angin",
    "stabilizer": "Stavolt", "stabilisator": "Stavolt", "air conditioner": "AC", "a c": "AC"
};

/** Nama barang yang dikoreksi ke kamus bila sangat mirip. */
export function canonicalName(name, vocab) {
    const n = norm(name);
    if (!n) return { name: "", notes: [] };
    if (ALIAS[n]) {
        const to = ALIAS[n];
        return { name: to, notes: norm(to) === n ? [] : [{ level: "info", text: `Nama "${str(name)}" diseragamkan menjadi "${to}".` }] };
    }
    let best = null;
    for (const v of vocab) {
        const nv = norm(v);
        if (nv === n) return { name: v, notes: [] };
        if (digitsOf(v) !== digitsOf(name)) continue;          // "Lab 1" ≠ "Lab 2"
        const sc = similarity(n, nv);
        if (sc > (best?.sc || 0)) best = { v, sc };
    }
    if (best && best.sc >= 0.88 && n.length >= 4) {
        return { name: best.v, notes: [{ level: "info", text: `Nama "${str(name)}" dikoreksi menjadi "${best.v}" (kemiripan ${Math.round(best.sc * 100)}%).` }] };
    }
    if (best && best.sc >= 0.78 && n.length >= 4) {
        return { name: smartCase(name), notes: [{ level: "warn", text: `Mungkin maksud Anda "${best.v}"? (kemiripan ${Math.round(best.sc * 100)}%, tidak diubah).` }] };
    }
    return { name: smartCase(name), notes: [] };
}

/* ---------- pencocokan ruangan ---------- */

const ROOM_ABBR = { kls: "kelas", lab: "laboratorium", labkom: "laboratorium komputer", perpus: "perpustakaan", r: "ruang" };

function roomKey(s) {
    let k = norm(s).replace(/-/g, " ").split(" ").map((w) => ROOM_ABBR[w] || w).join(" ");
    k = k.replace(/^(ruang|ruangan)\s+/, "").replace(/\s+/g, " ").trim();
    if (/^[xiv]+ \d+$/.test(k)) k = `kelas ${k}`;       // "XII-1" -> "kelas xii 1"
    return k;
}

export function matchRoom(text, rooms) {
    const key = roomKey(text);
    if (!key) return { room: null, score: 0 };
    let best = { room: null, score: 0 };
    for (const r of rooms) {
        const cands = [roomKey(r.namaRuang), roomKey(r.kodeRuang)];
        for (const c of cands) {
            if (!c) continue;
            if (c === key) return { room: r, score: 1 };
            if (digitsOf(c) !== digitsOf(key)) continue;
            const sc = similarity(c, key);
            if (sc > best.score) best = { room: r, score: sc };
        }
    }
    return best.score >= 0.8 ? best : { room: null, score: best.score };
}

/* ---------- pipeline ---------- */

const SKIP_NAME = /^(pengurus barang|nip|mengetahui|kepala sma|wakasek|penanggung jawab|mojokerto,|jumlah|total)\b/i;

function isNumberingRow(cells) {
    const vals = cells.map(str).filter(Boolean);
    return vals.length >= 3 && vals.every((v) => /^\d{1,2}$/.test(v));
}

/**
 * @param {Array<{name:string, rows:any[][]}>} sheets  isi tiap sheet (baris x kolom)
 * @param {{rooms:Array, assets:Array}} existing         data yang sudah ada di database
 */
export function cleanImport(sheets, existing = { rooms: [], assets: [] }) {

    const rows = [];
    const skipped = [];
    const vocab = new Set(NAMA_UMUM);
    existing.assets.forEach((a) => a.namaBarang && vocab.add(String(a.namaBarang)));
    const vocabList = () => [...vocab];

    const seen = new Map();
    const existingKeys = new Set(existing.assets.map((a) =>
        [a.kodeRuang, norm(a.namaBarang), norm(a.merk), a.tahun || "", norm(a.kodeBarangResmi)].join("|")));

    for (const sheet of sheets) {

        const det = detectColumns(sheet.rows);
        if (!det) { skipped.push(sheet.name); continue; }

        const { headerRow, map } = det;
        const col = (field) => Object.keys(map).find((c) => map[c].field === field);
        const idx = Object.fromEntries(Object.keys(FIELD_LABEL).map((f) => [f, col(f)]));
        const sheetRoom = detectRoomFromHeader(sheet.rows, headerRow);

        for (let r = headerRow + 1; r < sheet.rows.length; r++) {
            const cells = sheet.rows[r] || [];
            if (cells.every((c) => !str(c))) continue;
            if (isNumberingRow(cells)) continue;

            const get = (f) => (idx[f] === undefined ? "" : cells[idx[f]]);
            const rawName = str(get("namaBarang"));
            if (!rawName || SKIP_NAME.test(rawName)) continue;

            const notes = [];
            const push = (n) => n.forEach((x) => notes.push(x));

            /* ruangan */
            const ruanganRaw = str(get("ruangan")) || sheetRoom || sheet.name.replace(/^r\.?\s*/i, "");
            const mr = matchRoom(ruanganRaw, existing.rooms);
            let roomCode = mr.room ? mr.room.kodeRuang : null;
            if (mr.room && mr.score < 1) notes.push({ level: "warn", text: `Ruangan "${ruanganRaw}" dicocokkan ke "${mr.room.namaRuang}" (${Math.round(mr.score * 100)}%).` });
            if (!mr.room) notes.push({ level: "info", text: `Ruangan "${ruanganRaw}" belum ada; akan dibuat baru saat impor.` });

            /* nama + merk */
            const cn = canonicalName(rawName, vocabList());
            push(cn.notes);
            vocab.add(cn.name);
            const merkRaw = str(get("merk"));
            const merk = merkRaw && !/^[-–—]$/.test(merkRaw) ? smartCase(merkRaw) : "";

            const jumlah = parseJumlah(get("jumlah")); push(jumlah.notes);
            const tahun = parseTahun(get("tahun")); push(tahun.notes);
            const kode = parseKode(get("kodeResmi")); push(kode.notes);
            const kond = parseKondisi(get("kondisi")); push(kond.notes);
            const sumber = parseSumberDana(get("sumberDana")); push(sumber.notes);
            const nilai = parseNilai(get("nilai")); push(nilai.notes);

            const catatan = [str(get("catatan")), kond.rest].filter(Boolean).join("; ");

            /* duplikat */
            const dupKey = [roomCode || norm(ruanganRaw), norm(cn.name), norm(merk), tahun.value || "", norm(kode.value), kond.value].join("|");
            let duplicate = false;
            if (seen.has(dupKey)) {
                notes.push({ level: "warn", text: `Duplikat dengan baris ${seen.get(dupKey)} di file ini.` });
                duplicate = true;
            } else {
                seen.set(dupKey, `${sheet.name}#${r + 1}`);
            }
            const exKey = [roomCode, norm(cn.name), norm(merk), tahun.value || "", norm(kode.value)].join("|");
            if (roomCode && existingKeys.has(exKey)) {
                notes.push({ level: "warn", text: "Barang serupa sudah ada di database." });
                duplicate = true;
            }

            const hasError = notes.some((n) => n.level === "error");
            const hasWarn = notes.some((n) => n.level === "warn");

            rows.push({
                sheet: sheet.name,
                rowNo: r + 1,
                ruanganRaw,
                roomCode,
                namaBarang: cn.name,
                merk,
                tahun: tahun.value,
                kodeBarangResmi: kode.value,
                jumlah: jumlah.value,
                kodeKondisi: kond.value,
                kodeSumber: sumber.value,
                nilai: nilai.value,
                catatan,
                notes,
                duplicate,
                status: hasError ? "error" : hasWarn ? "warn" : "ok",
                include: !hasError && !duplicate
            });
        }
    }

    return { rows, skipped, summary: summarize(rows) };
}

export function summarize(rows) {
    const s = { total: rows.length, ok: 0, warn: 0, error: 0, newRooms: 0, selected: 0 };
    const rooms = new Set();
    rows.forEach((r) => {
        s[r.status] += 1;
        if (!r.roomCode) rooms.add(norm(r.ruanganRaw));
        if (r.include) s.selected += 1;
    });
    s.newRooms = rooms.size;
    return s;
}

/** Validasi ulang satu baris setelah diedit manual. */
export function revalidate(row) {
    const notes = row.notes.filter((n) => n.level !== "error");
    if (!String(row.namaBarang || "").trim()) notes.push({ level: "error", text: "Nama barang kosong." });
    if (!(Number(row.jumlah) >= 1)) notes.push({ level: "error", text: "Jumlah harus ≥ 1." });
    row.notes = notes;
    const hasError = notes.some((n) => n.level === "error");
    const hasWarn = notes.some((n) => n.level === "warn");
    row.status = hasError ? "error" : hasWarn ? "warn" : "ok";
    if (hasError) row.include = false;
    return row;
}

/* ---------- CSV ---------- */

export function parseCsv(text) {
    const first = text.split(/\r?\n/, 1)[0] || "";
    const delim = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ";" : ",";
    const rows = [];
    let row = [], cell = "", q = false;
    const src = text.replace(/^﻿/, "");
    for (let i = 0; i < src.length; i++) {
        const ch = src[i];
        if (q) {
            if (ch === '"') { if (src[i + 1] === '"') { cell += '"'; i++; } else q = false; }
            else cell += ch;
        } else if (ch === '"') q = true;
        else if (ch === delim) { row.push(cell); cell = ""; }
        else if (ch === "\n" || ch === "\r") {
            if (ch === "\r" && src[i + 1] === "\n") i++;
            row.push(cell); rows.push(row); row = []; cell = "";
        } else cell += ch;
    }
    if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
    return rows;
}
