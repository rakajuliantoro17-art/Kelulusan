/*
==========================================================
SARPRASIN v2.0
DATA TETAP INVENTARIS (kondisi, sumber dana, jenis ruang)
File : src/assets/js/shared/inventory-data.js

Dibuat tetap di kode supaya form bisa dipakai tanpa harus
mengisi koleksi master di Firestore dulu.
==========================================================
*/

import { getAll, getById, getWhere, COLLECTION } from "../../../services/firebase/index.js";
import { toRows } from "./admin-shell.js";

/* Pilihan mengikuti spreadsheet sekolah:
   Baik / Perlu Perbaikan / Rusak Berat.
   Untuk KIR: Perlu Perbaikan = Rusak Ringan (RR). */
export const KONDISI = [
    { value: "BAIK",         label: "Baik",                          short: "B"  },
    { value: "RUSAK_RINGAN", label: "Perlu Perbaikan (Rusak Ringan)", short: "RR" },
    { value: "RUSAK_BERAT",  label: "Rusak Berat",                   short: "RB" }
];

/* Kode sumber dana dari spreadsheet (BOSP, BOSK, BPPOP) + cadangan.
   Mau menambah? Cukup tambah baris di sini. */
export const SUMBER_DANA = [
    { value: "BOSP",    label: "BOSP" },
    { value: "BOSK",    label: "BOSK" },
    { value: "BPPOP",   label: "BPPOP" },
    { value: "APBD",    label: "APBD" },
    { value: "APBN",    label: "APBN" },
    { value: "KOMITE",  label: "Komite / Sumbangan" },
    { value: "HIBAH",   label: "Hibah" },
    { value: "LAINNYA", label: "Lainnya" }
];

export const JENIS_RUANG = [
    { value: "KELAS",      label: "Ruang Kelas" },
    { value: "LAB",        label: "Laboratorium" },
    { value: "PERPUS",     label: "Perpustakaan" },
    { value: "KANTOR",     label: "Ruang Kantor / Guru" },
    { value: "OLAHRAGA",   label: "Sarana Olahraga" },
    { value: "IBADAH",     label: "Tempat Ibadah" },
    { value: "LAINNYA",    label: "Lainnya" }
];

export const JENIS_BANGUNAN = [
    { value: "GEDUNG_KELAS", label: "Gedung Kelas" },
    { value: "GEDUNG_KANTOR", label: "Gedung Kantor / Administrasi" },
    { value: "LAB_PERPUS", label: "Gedung Lab / Perpustakaan" },
    { value: "OLAHRAGA", label: "Gedung / Lapangan Olahraga" },
    { value: "IBADAH", label: "Tempat Ibadah" },
    { value: "PENUNJANG", label: "Penunjang (kantin, toilet, gudang, dll.)" },
    { value: "LAINNYA", label: "Lainnya" }
];

/* Kop & identitas mengikuti format KIR di spreadsheet sekolah */
export const SEKOLAH = {
    instansi1: "PEMERINTAH PROVINSI JAWA TIMUR",
    instansi2: "DINAS PENDIDIKAN",
    nama: "SMA NEGERI 1 SOOKO MOJOKERTO",
    alamat: "Jalan R. Akhmad Basuni No. 361 Kec. Sooko, Kabupaten Mojokerto 61361",
    kontak: "Pos-el : info@sman1sooko.sch.id Laman : www.sman1sooko.sch.id",
    provinsi: "JAWA TIMUR",
    kabupaten: "MOJOKERTO",
    skpd: "CABANG DINAS PENDIDIKAN JAWA TIMUR WIL KAB/KOTA MOJOKERTO",
    unitKerja: "SMAN 1 SOOKO",
    kodeLokasi: "010101.00020.21110",
    kota: "Mojokerto"
};

/* Penandatangan KIR disimpan di Firestore (master/kir) supaya tidak ada
   nama/NIP pejabat di kode publik. Diisi admin sekali di halaman KIR. */
export const SIGNER_FIELDS = [
    "kepsekNama", "kepsekPangkat", "kepsekNip",
    "wakaNama", "wakaNip",
    "pengurusNama", "pengurusNip"
];

export async function loadSigners() {
    try {
        const snap = await getById(COLLECTION.MASTER, "kir");
        return snap.exists() ? snap.data() : {};
    } catch (error) {
        console.warn("Penandatangan KIR belum bisa dimuat:", error.message);
        return {};
    }
}

export function labelOf(list, value) {
    return list.find((i) => i.value === value)?.label || value || "-";
}

/** Teks kondisi apa pun (spreadsheet lama / kode lama) -> kode baku */
export function normalizeKondisi(value) {
    const v = String(value || "").trim().toUpperCase().replace(/[\s-]+/g, "_");
    if (v === "BAIK" || v === "B") return "BAIK";
    if (["RUSAK_RINGAN", "RR", "PERBAIKAN", "PERLU_PERBAIKAN"].includes(v)) return "RUSAK_RINGAN";
    if (["RUSAK_BERAT", "RB", "RUSAK"].includes(v)) return "RUSAK_BERAT";
    return "BAIK";
}

export async function loadRooms() {
    const rows = toRows(await getAll(COLLECTION.ROOMS));
    return rows
        .map((r) => ({
            ...r,
            kodeRuang: r.kodeRuang || r.id,
            namaRuang: r.namaRuang || r.nama || r.id
        }))
        .sort((a, b) => a.namaRuang.localeCompare(b.namaRuang, "id", { numeric: true }));
}

export async function loadBuildings() {
    const rows = toRows(await getAll(COLLECTION.BUILDINGS));
    return rows
        .map((b) => ({ ...b, kodeBangunan: b.kodeBangunan || b.id, namaBangunan: b.namaBangunan || b.id }))
        .sort((a, b) => a.namaBangunan.localeCompare(b.namaBangunan, "id", { numeric: true }));
}

export async function loadProcurements() {
    return toRows(await getAll(COLLECTION.PROCUREMENTS))
        .sort((a, b) => String(b.tanggal || "").localeCompare(String(a.tanggal || "")));
}

export const rupiah = (n) => "Rp " + (Number(n) || 0).toLocaleString("id-ID");

export async function loadAssets() {
    return toRows(await getAll(COLLECTION.ASSETS));
}

/** Aset hanya untuk ruangan tertentu (portal User). Satu query per ruangan
    supaya cocok dengan Firestore Rules. */
export async function loadAssetsForRooms(codes) {
    const parts = await Promise.all(
        codes.map((k) => getWhere(COLLECTION.ASSETS, "kodeRuang", "==", k).then(toRows))
    );
    return parts.flat();
}

/** Kode barang berikutnya untuk sebuah ruangan, mis. KLS-X-1-004 */
export function nextKodeBarang(assets, kodeRuang) {
    const prefix = `${kodeRuang}-`;
    const max = assets
        .map((a) => String(a.kodeBarang || ""))
        .filter((k) => k.startsWith(prefix))
        .map((k) => parseInt(k.slice(prefix.length), 10))
        .filter((n) => !Number.isNaN(n))
        .reduce((a, b) => Math.max(a, b), 0);
    return `${prefix}${String(max + 1).padStart(3, "0")}`;
}
