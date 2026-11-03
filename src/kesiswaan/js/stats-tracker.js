/*
==========================================================
SMANSASOO Kesiswaan Portal
Stats Tracker
Version : 1.1.0
==========================================================
Mengirim SATU "hit" ke /api/stats setiap kali halaman
dimuat, memakai data-page dari <body> (sudah ada di semua
halaman, lihat js/shell.js).

SENGAJA fire-and-forget:
- Tidak menunggu response.
- Kalau gagal (mis. statistik belum diaktifkan di server,
  atau user sedang offline), diam-diam diabaikan -- tidak
  pernah menampilkan error ke pengguna maupun menghambat
  render halaman.

CHANGELOG (v1.1.0):
- Maksimal SATU hit per halaman per sesi tab. Refresh atau
  pindah-pindah halaman lalu kembali di tab yang sama tidak
  menambah hitungan lagi. Penanda disimpan di sessionStorage
  (hilang otomatis saat tab ditutup, jadi tab/sesi baru
  dihitung lagi).
- Kalau sessionStorage tidak tersedia (mode privat tertentu,
  dll), hit tetap dikirim seperti sebelumnya.
==========================================================
*/

(function () {

    if (!document.body) return;

    const page = document.body.dataset.page;

    if (!page) return;

    const STORAGE_KEY = "kesiswaan-stats-hit:" + page;

    // Sudah pernah dihitung di sesi tab ini? -> lewati.
    // Penanda baru dipasang SETELAH server memastikan hit tercatat
    // (success + configured). Dulu dipasang sebelum kirim, sehingga hit
    // yang gagal / saat statistik belum aktif ikut "terkunci" dan tidak
    // pernah dihitung ulang di tab yang sama.
    try {
        if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch (e) {}

    // Cegah kirim ganda kalau script berjalan dua kali di halaman yang sama.
    if (window.__kesiswaanStatsSent) return;
    window.__kesiswaanStatsSent = true;

    try {

        fetch(`/api/kesiswaan/stats?page=${encodeURIComponent(page)}`, {
            method: "POST",
            cache: "no-store",
            keepalive: true
        })
            .then((r) => r.json())
            .then((j) => {
                if (j && j.success && j.configured) {
                    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}
                }
            })
            .catch(() => {});

    } catch (e) {

        // diam-diam diabaikan, lihat catatan di atas.

    }

})();
