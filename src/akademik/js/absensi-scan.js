/*
==========================================================
SMANSASOO Academic Portal
Absensi Scan (Kiosk) Script
Version : 1.0.0
==========================================================
Mode kiosk: siswa antre, scan QR kartu masing-masing sendiri
lewat kamera. Alur:

  1. Guru/petugas pilih Mapel + Jam Ke sekali di awal sesi
     (form setup), lalu klik "Mulai Sesi".
  2. Kamera aktif terus-menerus (library "html5-qrcode",
     dimuat lewat CDN di pages/absensi-scan.html). Begitu QR
     cocok format kita, panggil POST /api/absensi.
  3. Hasil (berhasil / sudah absen / NIS tidak dikenal)
     ditampilkan besar selama beberapa detik, lalu kamera
     otomatis lanjut scan siswa berikutnya (pause/resume,
     BUKAN start/stop ulang, supaya tidak ada delay re-init
     kamera di setiap siswa).

Format isi QR (dibuat oleh pages/absensi-admin.html):
  Kartu Kesiswaan : SSK1.<NIS>.<tanda tangan>   (utama, ada foto)
  QR lama (JSON)  : {"t":"SMANSASOO-ABSEN","nis":"<NIS>"}
==========================================================
*/

(function () {

    const setupCard = document.getElementById("absensiScanSetup");
    const sessionCard = document.getElementById("absensiScanSession");

    const mapelInput = document.getElementById("absensiScanMapel");
    const jamKeInput = document.getElementById("absensiScanJamKe");
    const startBtn = document.getElementById("absensiScanStartBtn");
    const endBtn = document.getElementById("absensiScanEndBtn");

    const sessionMapelLabel = document.getElementById("absensiScanSessionMapel");
    const sessionJamLabel = document.getElementById("absensiScanSessionJam");

    const readerEl = document.getElementById("absensiScanReader");
    const feedbackEl = document.getElementById("absensiScanFeedback");
    const countEl = document.getElementById("absensiScanCount");

    let html5Qrcode = null;
    let isPaused = false;
    let recordedCount = 0;
    let currentSession = null; // { mapel, jamKe }

    function showFeedback(type, title, detail) {

        feedbackEl.className = "absensi-scan-feedback show " + type;
        feedbackEl.innerHTML = `${title}${detail ? `<small>${detail}</small>` : ""}`;

    }

    function hideFeedback() {

        feedbackEl.className = "absensi-scan-feedback";
        feedbackEl.innerHTML = "";

    }

    function updateCount() {

        if (countEl) {
            countEl.textContent = `${recordedCount} siswa tercatat pada sesi ini`;
        }

    }

    // Hasil: { kode } untuk kartu Kesiswaan (SSK1.<NIS>.<tanda>, diverifikasi server),
    // { nis } untuk QR lama berformat JSON, atau null kalau bukan QR kita.
    function parseQrText(text) {

        const raw = String(text || "").trim();

        if (/^SSK1\.[A-Za-z0-9\-_]{1,24}\.[0-9A-F]{10}$/.test(raw)) return { kode: raw };

        try {

            const data = JSON.parse(raw);

            if (data && data.t === "SMANSASOO-ABSEN" && data.nis) {
                return { nis: String(data.nis) };
            }

            return null;

        } catch {

            return null;

        }

    }

    function escapeHtml(s) {

        return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    }

    function fotoHtml(data) {

        if (!data || !data.foto) return "";

        return `<img class="absensi-scan-foto" src="${escapeHtml(data.foto)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">`;

    }

    async function handleDecoded(text) {

        if (isPaused) return;

        const parsed = parseQrText(text);

        if (!parsed) {
            showFeedback("err", "QR tidak dikenali", "Pastikan ini kartu QR absensi SMANSASOO.");
            pauseThenResume(1500);
            return;
        }

        isPaused = true;

        try {

            const response = await fetch("/api/absensi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...parsed,
                    mapel: currentSession.mapel,
                    jamKe: currentSession.jamKe
                })
            });

            const result = await response.json();

            if (result.status === "recorded") {

                showFeedback("ok", `${fotoHtml(result.data)}&#10003; ${escapeHtml(result.data.nama)}`, `${escapeHtml(result.data.kelas || "")} &middot; berhasil dicatat hadir`.trim());
                recordedCount += 1;
                updateCount();

            } else if (result.status === "duplicate") {

                showFeedback("warn", `${fotoHtml(result.data)}${escapeHtml(result.data.nama)}`, "Sudah tercatat hadir untuk sesi ini.");

            } else if (result.status === "invalid") {

                showFeedback("err", "QR tidak dikenali", escapeHtml(result.message || "Bukan kartu siswa SMAN 1 Sooko."));

            } else if (result.status === "not_found") {

                showFeedback("err", "NIS tidak ditemukan", "Siswa belum terdaftar di data absensi.");

            } else {

                showFeedback("err", "Gagal mencatat", result.message || "Terjadi kesalahan.");

            }

        } catch (err) {

            showFeedback("err", "Gagal mencatat", "Periksa koneksi internet, lalu coba lagi.");

        }

        pauseThenResume(2000);

    }

    function pauseThenResume(delay) {

        setTimeout(() => {

            hideFeedback();
            isPaused = false;

        }, delay);

    }

    async function startCamera() {

        if (!window.Html5Qrcode) {
            showFeedback("err", "Kamera tidak tersedia", "Library pemindai QR gagal dimuat.");
            return;
        }

        html5Qrcode = new window.Html5Qrcode("absensiScanReader");

        try {

            await html5Qrcode.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: 240 },
                (decodedText) => handleDecoded(decodedText),
                () => { /* frame tanpa QR, abaikan */ }
            );

        } catch (err) {

            showFeedback("err", "Tidak bisa membuka kamera", "Izinkan akses kamera di browser, lalu muat ulang halaman.");

        }

    }

    async function stopCamera() {

        if (html5Qrcode) {

            try {
                await html5Qrcode.stop();
                await html5Qrcode.clear();
            } catch {
                // kamera mungkin sudah berhenti, abaikan
            }

            html5Qrcode = null;

        }

    }

    function startSession() {

        const mapel = (mapelInput?.value || "").trim();
        const jamKe = (jamKeInput?.value || "").trim();

        if (!mapel || !jamKe) {
            alert("Mapel dan Jam Ke- wajib diisi.");
            return;
        }

        currentSession = { mapel, jamKe };
        recordedCount = 0;
        updateCount();

        if (sessionMapelLabel) sessionMapelLabel.textContent = mapel;
        if (sessionJamLabel) sessionJamLabel.textContent = jamKe;

        setupCard.style.display = "none";
        sessionCard.style.display = "block";

        startCamera();

    }

    async function endSession() {

        await stopCamera();

        currentSession = null;
        hideFeedback();

        sessionCard.style.display = "none";
        setupCard.style.display = "block";

    }

    if (startBtn) startBtn.addEventListener("click", startSession);
    if (endBtn) endBtn.addEventListener("click", endSession);

})();
