/*
==========================================================
SMANSASOO Academic Portal
Nilai API Service
Version : 2.0.0
==========================================================
CHANGELOG (v2.0.0):
- Tidak lagi memanggil Apps Script eksternal. Sekarang
  memanggil /api/nilai, Vercel Serverless Function di repo
  yang sama, yang membaca data langsung dari Google Sheets
  di sisi server. Browser tidak pernah tahu URL atau ID
  spreadsheet-nya.
==========================================================
*/

async function fetchNilaiJSON(url) {

    const controller = new AbortController();

    const timeout = setTimeout(
        () => controller.abort(),
        CONFIG.API_TIMEOUT
    );

    try {

        // Staf yang sedang login ikut mengirim token, supaya server menyertakan
        // foto dan QR siswa. Pengunjung biasa tidak punya token dan tidak
        // menerima data itu.
        const headers = {};

        try {
            const sesi = JSON.parse(sessionStorage.getItem("smansasoo-admin-session") || "null");
            if (sesi && sesi.token && Date.now() < (sesi.exp || 0) * 1000) {
                headers.Authorization = "Bearer " + sesi.token;
            }
        } catch (e) { /* sessionStorage tidak tersedia, lanjut tanpa token */ }

        const response = await fetch(url, {
            cache: "no-store",
            signal: controller.signal,
            headers
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();

    } finally {

        clearTimeout(timeout);

    }

}

/**
 * ==========================================
 * SEARCH NILAI BY NIS
 * ==========================================
 */

async function searchNilai(keyword, tahun) {

    if (!keyword) {
        throw new Error("Keyword tidak boleh kosong.");
    }

    const params = new URLSearchParams({ keyword });

    if (tahun) {
        params.set("tahun", tahun);
    }

    // Path absolut ("/api/nilai") supaya tetap benar dipanggil
    // dari halaman mana pun, termasuk dari dalam /pages/.
    const result = await fetchNilaiJSON(`/api/nilai?${params.toString()}`);

    if (!result.message) {

        result.message = result.success
            ? CONFIG.MESSAGE.SUCCESS
            : CONFIG.MESSAGE.NOT_FOUND;

    }

    return result;

}

/**
 * ==========================================
 * EXPORT
 * ==========================================
 */

window.NilaiAPI = {

    searchNilai

};
