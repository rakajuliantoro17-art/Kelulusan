# JARVIS Personal — Product & Technical Plan

> **Dokumen:** doc/jarvis.md  
> **Produk:** PINTUKU — SMAN 1 Sooko  
> **Status:** Future Vision / Belum masuk implementasi  
> **Versi spesifikasi:** 1.0  
> **Tanggal:** 3 November 2026  
> **Branch acuan:** main

---

## 1. Ringkasan

JARVIS Personal adalah rancangan asisten AI pribadi berbasis suara (voice-first conversational assistant) yang kelak dapat diakses melalui web PINTUKU. JARVIS bukan chatbot teks yang sekadar diberi tombol mikrofon. Interaksi utamanya adalah percakapan dua arah secara natural: pengguna memanggil JARVIS, berbicara, mendengar jawaban suara, mengajukan pertanyaan lanjutan, dan dapat menyela ketika JARVIS sedang berbicara.

JARVIS Personal diposisikan sebagai fitur masa depan. Dokumen ini menjadi baseline produk, arsitektur, keamanan, dan roadmap agar pengembangan kelak terarah. **Dokumen ini tidak mengizinkan implementasi langsung, tidak mengubah modul berjalan, dan tidak mengubah struktur root repository.**

### 1.1 Spesifikasi yang telah diputuskan

| Aspek | Keputusan |
|---|---|
| Nama | JARVIS Personal |
| Karakter | Friendly: komunikatif, natural, bersahabat, tetap cerdas dan jelas |
| Aktivasi | Wake word “JARVIS” |
| Platform | Web di dalam ekosistem PINTUKU |
| Memori | Session-only; tidak membangun profil atau memori personal permanen |
| Bahasa utama | Bahasa Indonesia |
| Interaksi utama | Suara masuk dan suara keluar secara real-time |
| Pengalaman | Percakapan dua arah, pertanyaan lanjutan, interupsi, dan kontrol sesi |
| Status | Future Development |
| Integrasi modul PINTUKU | Tahap lanjutan, setelah produk voice mandiri stabil |
| Perubahan root | Dilarang; seluruh kode masa depan ditempatkan di bawah src/ dan mengikuti pola repository |

### 1.2 Prinsip produk

1. **Voice-first:** suara merupakan cara utama berinteraksi; teks/transkrip bersifat pendamping dan opsional.
2. **Natural conversation:** tidak memerlukan pola tanya-jawab kaku atau tombol kirim untuk setiap ujaran.
3. **User-controlled:** mikrofon, sesi, dan penghentian percakapan selalu berada dalam kendali pengguna.
4. **Privacy by design:** deteksi wake word lokal; audio tidak dikirim ke layanan AI sebelum pengguna memanggil JARVIS dan sesi percakapan dimulai.
5. **Session-only memory:** konteks percakapan hanya hidup selama sesi; tidak disimpan sebagai memori personal permanen.
6. **Secure by default:** kredensial provider tidak pernah ditanam di frontend.
7. **Modular:** JARVIS tidak boleh merusak, menggantikan, atau memaksa restrukturisasi modul PINTUKU yang sudah ada.
8. **Honest capability:** status fitur dibedakan antara implemented, in development, dan future vision.

---

## 2. Tujuan dan batasan

### 2.1 Tujuan

- Menghadirkan asisten pribadi yang dapat dipanggil dengan wake word “JARVIS” ketika halaman web aktif dan izin mikrofon tersedia.
- Mendukung percakapan Bahasa Indonesia dengan respons suara yang natural.
- Mempertahankan konteks dalam satu sesi percakapan.
- Mendukung barge-in/interruption: pengguna dapat menyela respons suara.
- Menampilkan status sistem secara jelas: standby, listening, thinking, speaking, interrupted, dan disconnected.
- Menjadi fondasi yang kelak dapat dihubungkan secara terbatas dan aman dengan layanan PINTUKU.

### 2.2 Bukan tujuan pada tahap awal

- Bukan asisten yang selalu aktif ketika browser ditutup, tab ditangguhkan, komputer tidur, atau perangkat terkunci.
- Bukan sistem pengawasan mikrofon atau perekam percakapan.
- Bukan pengganti kewenangan Kepala Sekolah, guru, tenaga kependidikan, atau operator.
- Belum menjalankan perintah administratif atau mengubah data PINTUKU.
- Belum memerlukan machine learning khusus, vector database, RAG, multi-agent, atau autonomous workflow.
- Tidak membuat memori jangka panjang, profil kebiasaan, atau pembelajaran personal lintas sesi.
- Tidak menjanjikan kemampuan setara JARVIS dalam film; istilah JARVIS merupakan inspirasi pengalaman produk.

---

## 3. Pengalaman pengguna

### 3.1 Alur utama

1. Pengguna membuka halaman JARVIS di PINTUKU.
2. Pengguna membaca penjelasan privasi dan memberikan izin mikrofon.
3. Pengguna menekan tombol **Aktifkan Wake Word**.
4. Komponen wake-word berjalan lokal di browser/perangkat selama halaman dan sesi tetap aktif.
5. Pengguna mengucapkan “JARVIS”.
6. Antarmuka berpindah ke status **Listening** dan percakapan real-time dimulai.
7. Pengguna berbicara secara natural.
8. JARVIS memahami ujaran dan menjawab dengan audio.
9. Pengguna dapat mengajukan pertanyaan lanjutan atau menyela jawaban.
10. Pengguna mengucapkan perintah akhir yang disepakati atau menekan **Akhiri Sesi**.
11. Audio stream, koneksi real-time, timer sesi, dan konteks sementara dihentikan/dibersihkan.

### 3.2 Contoh percakapan

**Pengguna:** “JARVIS.”

**JARVIS:** “Ya, saya di sini. Ada yang ingin kita bahas?”

**Pengguna:** “Bantu saya memikirkan prioritas pekerjaan minggu ini.”

**JARVIS:** “Tentu. Kita bisa mulai dari pekerjaan yang paling mendesak. Apakah ada tenggat yang perlu dipertimbangkan?”

**Pengguna:** “Ada penyelesaian modul Tata Usaha.”

**JARVIS:** “Baik. Kita fokus pada modul Tata Usaha terlebih dahulu. Saya bisa membantu mengurai pekerjaan menjadi beberapa langkah.”

Contoh ini menggambarkan gaya percakapan, bukan klaim bahwa fitur telah tersedia.

### 3.3 Kepribadian dan gaya suara

- Friendly, tenang, tanggap, dan tidak terlalu formal.
- Bahasa Indonesia baku-luwes; istilah teknis digunakan saat konteks memerlukannya.
- Jawaban lisan ringkas secara default; penjelasan panjang diberikan bila diminta.
- Tidak berpura-pura memiliki perasaan, kesadaran, atau pengalaman manusia.
- Tidak menyebut data atau aktivitas yang tidak benar-benar dapat diakses.
- Tidak memanggil pengguna dengan nama secara berlebihan.
- Pengaturan suara/voice persona dapat ditambahkan setelah uji kualitas Bahasa Indonesia.

### 3.4 Status antarmuka

| Status | Makna | Visual yang direncanakan |
|---|---|---|
| Standby | Wake-word engine aktif lokal | Orb berdenyut perlahan |
| Listening | Audio percakapan sedang ditangkap | Gelombang audio bergerak |
| Thinking | AI sedang memproses | Animasi pemrosesan |
| Speaking | JARVIS mengeluarkan audio | Orb bereaksi terhadap audio |
| Interrupted | Ucapan JARVIS dihentikan oleh pengguna | Animasi berhenti, kembali mendengar |
| Reconnecting | Koneksi sedang dipulihkan | Indikator koneksi |
| Disconnected | Tidak ada koneksi percakapan | Status offline dan tombol sambungkan |
| Permission Required | Izin mikrofon belum diberikan | Instruksi izin yang jelas |
| Error | Terjadi kegagalan | Pesan yang aman dan tindakan pemulihan |

### 3.5 Kontrol wajib

- Aktifkan/nonaktifkan wake word.
- Mulai/akhiri sesi percakapan.
- Mute/unmute mikrofon.
- Hentikan audio keluaran.
- Atur volume keluaran.
- Tampilkan/sembunyikan transkrip.
- Indikator mikrofon aktif dan status koneksi.
- Penjelasan ketika browser/perangkat tidak mendukung kemampuan tertentu.

---

## 4. Arsitektur konseptual

~~~text
PINTUKU WEB
└── JARVIS Personal UI
    ├── Jarvis Orb / Status
    ├── Voice Controls
    ├── Optional Transcript
    └── Session Controller
          |
          v
LOCAL VOICE LAYER
    ├── Microphone Permission
    ├── Local Wake-word Detection
    ├── Voice Activity Detection (VAD)
    └── Audio Device / Playback Control
          |
          | setelah wake word dan sesi dimulai
          v
SECURE SESSION GATEWAY (SERVER-SIDE)
    ├── User Authentication
    ├── Authorization / Rate Limit
    ├── Short-lived Realtime Credential
    └── Provider Session Configuration
          |
          v
REALTIME VOICE PROVIDER
    ├── Speech Input
    ├── Speech Understanding
    ├── Conversation Reasoning
    ├── Speech Output
    └── Interruption / Turn Management
          |
          v
TEMPORARY SESSION CONTEXT
    ├── Active Conversation Context
    ├── Session Settings
    └── Cleanup on End / Expiry

FUTURE ONLY:
PINTUKU MODULE APIs -> Authorized Tools -> Optional Specialist Agents
~~~

### 4.1 Frontend

Frontend mengikuti framework, pola routing, state management, dan design system yang sudah digunakan repository PINTUKU. Jangan menambahkan framework frontend baru tanpa audit kebutuhan.

Tanggung jawab frontend:
- Meminta izin mikrofon melalui browser.
- Menjalankan deteksi wake word lokal.
- Menampilkan status dan kontrol sesi.
- Membuat koneksi audio real-time setelah aktivasi.
- Menangani audio masuk/keluar dan interupsi.
- Mengelola state percakapan sementara.
- Membersihkan resource ketika sesi berakhir atau komponen dilepas.

### 4.2 Secure Session Gateway

Gateway berjalan di sisi server, bukan di browser. Bentuk implementasinya ditentukan setelah audit backend yang tersedia; dapat berupa server route, serverless function, atau Supabase Edge Function jika sesuai arsitektur repository.

Tanggung jawab:
- Memverifikasi sesi login pengguna jika JARVIS berada di area terautentikasi.
- Memvalidasi origin, metode, dan payload request.
- Menerapkan rate limit dan batas sesi.
- Menyimpan provider API key hanya pada secret/environment server.
- Meminta kredensial sementara atau membuat sesi real-time melalui mekanisme resmi provider.
- Mengembalikan hanya kredensial sementara yang memang aman untuk client.
- Tidak menjadi proxy audio penuh kecuali ada alasan teknis dan keamanan yang kuat.
- Tidak memberikan akses database atau tool administratif pada tahap personal voice awal.

**Larangan:** API key permanen provider, service-role key, dan secret server tidak boleh masuk ke bundle frontend, localStorage, source map publik, atau repository.

### 4.3 Realtime Voice Engine

OpenAI Realtime API merupakan kandidat utama untuk evaluasi karena mendukung percakapan audio real-time. WebRTC menjadi opsi transport utama untuk browser karena dirancang untuk komunikasi media interaktif.

Sebelum memilih dan mengunci implementasi, lakukan verifikasi terhadap dokumentasi resmi yang berlaku pada saat fase implementasi:
- Mekanisme autentikasi dan pembuatan token/sesi sementara.
- Model realtime yang tersedia dan dukungan audio Bahasa Indonesia.
- Format audio, codec, sample rate, dan batas sesi.
- Dukungan VAD, turn detection, dan interupsi.
- Kebijakan data, retensi, dan kontrol privasi.
- Harga audio input/output, durasi sesi, serta batas penggunaan.
- Kompatibilitas browser dan perangkat.

Jangan mengunci nama model, parameter API, atau format payload di dokumen ini sebagai kontrak permanen karena API dapat berubah.

### 4.4 Wake-word engine

Wake word “JARVIS” harus dideteksi secara lokal pada perangkat sejauh teknologi dan lisensinya memungkinkan.

Kriteria pemilihan:
- Dapat berjalan di browser modern.
- Tidak mengirim audio standby ke server.
- Mendukung kata pemicu khusus atau model kata pemicu yang dapat dikonfigurasi.
- Beban CPU/RAM rendah.
- Memiliki tingkat false accept dan false reject yang dapat diuji.
- Lisensi mengizinkan penggunaan yang direncanakan.
- Memiliki fallback tombol aktivasi jika tidak didukung.

Evaluasi kandidat engine berdasarkan dukungan WebAssembly/Web Worker, kebutuhan model, lisensi, ukuran unduhan, performa perangkat, dan kemudahan pemeliharaan. Jangan memilih library hanya berdasarkan demo.

**Batas platform web:** wake word tidak dijamin tetap aktif ketika tab ditutup, browser membekukan tab, perangkat sleep, browser kehilangan izin, atau sistem operasi menghentikan proses. Pengalaman selalu mendengarkan di background bukan bagian dari target versi web awal.

### 4.5 Session memory

Memori hanya berlaku untuk satu sesi aktif.

Ketentuan:
- Konteks percakapan berada pada memori sementara client/provider sesuai kebutuhan protokol.
- Tidak menulis transkrip atau audio ke Supabase, Firebase, atau database permanen secara default.
- Tidak membuat embedding/vector memory.
- Tidak membangun profil pengguna dari percakapan.
- Saat sesi berakhir, bersihkan state, audio buffer, object URL, stream, koneksi, dan timer.
- Terapkan expiry/inactivity timeout yang dapat dikonfigurasi.
- Jika koneksi terputus, kebijakan pemulihan harus menjelaskan apakah konteks sesi masih tersedia atau sesi harus dimulai ulang.
- Jangan mengklaim seluruh data telah dihapus dari sistem provider hanya karena state aplikasi dibersihkan. Retensi provider harus dijelaskan dan dikonfigurasi secara terpisah.

---

## 5. Rencana struktur kode

Struktur berikut merupakan rancangan lokasi kode masa depan, bukan instruksi untuk membuat seluruh direktori sekarang.

~~~text
src/
└── ai/
    └── personal-assistant/
        ├── components/
        │   ├── JarvisOrb.tsx
        │   ├── VoiceVisualizer.tsx
        │   ├── VoiceControls.tsx
        │   ├── SessionStatus.tsx
        │   └── OptionalTranscript.tsx
        │
        ├── audio/
        │   ├── microphone.ts
        │   ├── playback.ts
        │   ├── audio-devices.ts
        │   └── wake-word/
        │       ├── detector.ts
        │       ├── worker.ts
        │       └── adapter.ts
        │
        ├── realtime/
        │   ├── client.ts
        │   ├── connection.ts
        │   ├── session.ts
        │   ├── events.ts
        │   └── interruption.ts
        │
        ├── memory/
        │   ├── session-context.ts
        │   └── cleanup.ts
        │
        ├── security/
        │   ├── permissions.ts
        │   └── session-policy.ts
        │
        ├── hooks/
        │   ├── useJarvisSession.ts
        │   ├── useWakeWord.ts
        │   └── useAudioDevices.ts
        │
        ├── scripts/
        ├── tests/
        └── types/
~~~

Catatan:
- Struktur aktual harus mengikuti pola import alias, penamaan, testing, dan folder yang sudah ada.
- Endpoint gateway harus ditempatkan pada lokasi backend yang memang sudah digunakan repository atau layanan server yang telah disetujui. Jangan membuat folder root baru hanya untuk JARVIS.
- Jangan menduplikasi konfigurasi Supabase, Firebase, atau environment global.
- Jangan menambahkan paket sebelum mengevaluasi ukuran bundle, lisensi, keamanan, dan kompatibilitas.
- Folder doc/ adalah lokasi dokumentasi yang diminta; struktur root lainnya tidak diubah.

---

## 6. Roadmap implementasi

Semua fase berikut berstatus **rencana masa depan**. Pengerjaan baru dimulai setelah prioritas modul PINTUKU yang sedang berjalan diselesaikan atau ada keputusan eksplisit untuk mengubah prioritas.

### Fase 0 — Discovery dan technical readiness

**Tujuan:** memastikan integrasi sesuai kondisi repository dan biaya/risiko dapat diterima.

Pekerjaan:
1. Audit struktur frontend, routing, autentikasi, backend, dan environment.
2. Identifikasi cara terbaik menyediakan server-side session gateway tanpa perubahan root.
3. Verifikasi dokumentasi Realtime API terbaru.
4. Evaluasi dua atau lebih kandidat wake-word engine.
5. Uji dukungan Chrome, Edge, Firefox, Safari, desktop, dan mobile yang relevan.
6. Tinjau lisensi, kebijakan data, retensi provider, dan biaya.
7. Tetapkan batas durasi, batas penggunaan, dan mekanisme rate limit.
8. Buat threat model dan daftar risiko.

**Exit criteria:**
- ADR (Architecture Decision Record) disetujui.
- Provider dan wake-word engine dipilih berdasarkan bukti uji.
- Estimasi biaya per menit/sesi tersedia.
- Tidak ada kebutuhan perubahan root.
- Risiko privasi dan batas platform didokumentasikan.

### Fase 1 — Voice UI prototype

**Tujuan:** membangun tampilan tanpa koneksi AI terlebih dahulu.

Pekerjaan:
1. Membuat orb dan animasi status.
2. Membuat kontrol microphone, mute, end session, dan volume.
3. Membuat visualizer audio berbasis input simulasi.
4. Menyediakan panel izin mikrofon dan penjelasan privasi.
5. Memastikan desain responsif dan konsisten dengan PINTUKU glassmorphism.
6. Menguji aksesibilitas, keyboard control, dan kontras.

**Exit criteria:**
- Semua state visual dapat diuji.
- Tidak ada akses mikrofon otomatis.
- UI bekerja pada desktop dan mobile.
- Tidak mengubah halaman/modul existing.

### Fase 2 — Realtime voice proof of concept

**Tujuan:** membuktikan percakapan suara dua arah.

Pekerjaan:
1. Membuat secure session gateway.
2. Menggunakan kredensial sementara sesuai mekanisme resmi provider.
3. Membuat koneksi WebRTC dari browser.
4. Mengirim audio setelah pengguna memulai sesi.
5. Menerima dan memainkan audio respons.
6. Menangani permission denied, koneksi gagal, timeout, dan provider error.
7. Mengukur latensi dan kualitas percakapan Bahasa Indonesia.

**Exit criteria:**
- Pengguna dapat berbicara dan menerima jawaban suara.
- Secret tidak terpapar pada frontend.
- Koneksi dapat diakhiri dan resource dibersihkan.
- Error dapat dipulihkan atau dijelaskan dengan benar.

### Fase 3 — Local wake word

**Tujuan:** pengguna dapat memanggil JARVIS dengan ucapan “JARVIS”.

Pekerjaan:
1. Integrasi engine lokal yang telah lolos evaluasi.
2. Menguji variasi aksen, jarak mikrofon, noise, dan volume.
3. Mengukur false accept/false reject.
4. Mengoptimalkan CPU/RAM dan konsumsi baterai.
5. Menambahkan tombol fallback jika engine tidak tersedia.
6. Menjamin audio standby tidak dikirim ke provider AI.

**Exit criteria:**
- Wake word bekerja pada daftar browser/perangkat yang didukung.
- Pengguna dapat menonaktifkan deteksi.
- Tidak ada transmisi audio standby.
- Kegagalan deteksi tidak mengunci pengguna dari fitur.

### Fase 4 — Natural conversation dan interruption

**Tujuan:** membuat pengalaman percakapan terasa natural.

Pekerjaan:
1. Mengatur VAD/turn detection.
2. Menguji respons ketika pengguna berhenti sejenak.
3. Mendukung interupsi ketika JARVIS berbicara.
4. Menghentikan audio output dan membatalkan respons yang sedang berjalan saat disela.
5. Mengelola pergantian giliran bicara.
6. Menangani noise, ujaran tidak jelas, dan koneksi yang terputus.
7. Menyempurnakan prompt persona friendly dan Bahasa Indonesia.

**Exit criteria:**
- Pengguna dapat menyela respons.
- Tidak terjadi audio tumpang tindih yang mengganggu.
- Pertanyaan lanjutan dapat dipahami dalam konteks sesi.
- Respons tidak mengklaim kemampuan atau akses yang tidak dimiliki.

### Fase 5 — Session memory dan lifecycle

**Tujuan:** memastikan konteks dan pembersihan sesi berjalan konsisten.

Pekerjaan:
1. Menentukan state minimum yang diperlukan untuk satu sesi.
2. Menangani session expiry dan inactivity timeout.
3. Membersihkan transkrip lokal sesuai pilihan pengguna.
4. Menghapus audio buffer dan menutup media stream.
5. Mengakhiri koneksi provider.
6. Menguji refresh halaman, logout, tab close, dan network loss.
7. Memastikan tidak ada penulisan memori permanen.

**Exit criteria:**
- Konteks tersedia selama sesi aktif.
- Sesi baru tidak mewarisi konteks sesi lama.
- Logout/end session menjalankan cleanup.
- Tidak ada penyimpanan audio/transkrip permanen oleh aplikasi.

### Fase 6 — Beta dan hardening

**Tujuan:** menguji penggunaan terbatas sebelum rilis.

Pekerjaan:
1. Uji keamanan gateway dan token.
2. Uji rate limit dan abuse prevention.
3. Uji kompatibilitas browser/perangkat.
4. Uji latensi, kualitas audio, dan stabilitas koneksi.
5. Uji biaya penggunaan dan batas sesi.
6. Uji privasi dan retensi provider.
7. Menyusun panduan pengguna dan prosedur insiden.
8. Menyediakan feature flag agar fitur dapat dinonaktifkan tanpa mengganggu PINTUKU.

**Exit criteria:**
- Tidak ada secret exposure atau akses tanpa otorisasi.
- Tidak ada blocker pada alur utama.
- Batas penggunaan dan biaya dapat dikendalikan.
- Ada mekanisme rollback/disable.
- Pemilik produk menyetujui rilis beta.

---

## 7. Spesifikasi teknis lintas fase

### 7.1 Session lifecycle

State machine yang disarankan:

~~~text
DISABLED
   |
   v
PERMISSION_REQUIRED
   |
   v
STANDBY_LOCAL_WAKE
   |
   | wake word detected
   v
CONNECTING
   |
   v
LISTENING <------+
   |             |
   v             |
THINKING         |
   |             |
   v             |
SPEAKING --------+  user interruption
   |
   | end session / timeout / error
   v
CLEANUP
   |
   v
DISABLED
~~~

### 7.2 Pengelolaan sesi

Parameter awal untuk diuji, bukan nilai final:
- Maksimum durasi satu sesi: 15–20 menit, dapat dikonfigurasi.
- Inactivity timeout: 60–120 detik, dapat dikonfigurasi.
- Maksimum koneksi aktif per pengguna: satu sesi.
- Retry koneksi: terbatas dengan exponential backoff.
- Wake-word standby: hanya selama halaman aktif dan izin tersedia.
- Sesi baru: konteks baru, tanpa mewarisi transkrip sesi sebelumnya.

Nilai final ditentukan dari pengujian, biaya provider, dan pengalaman pengguna.

### 7.3 Observability

Logging hanya mencatat metadata teknis minimum:
- Waktu mulai/akhir sesi.
- Durasi sesi.
- Status koneksi.
- Kategori error.
- Versi aplikasi dan browser (bila diperlukan).
- Penggunaan token/durasi provider jika tersedia dan diperlukan untuk billing.

Jangan mencatat audio mentah atau transkrip percakapan secara default. Jangan memasukkan kredensial, token, atau informasi pribadi ke log.

### 7.4 Kinerja

Target awal untuk diuji:
- Wake-word detection lokal tidak menyebabkan UI freeze.
- Audio playback tidak mengalami jeda yang mengganggu.
- UI tetap responsif saat audio diproses.
- Bundle wake-word model dimuat secara lazy bila memungkinkan.
- Koneksi dan resource audio dilepas saat sesi selesai.
- Performa diuji pada perangkat sekolah dengan spesifikasi menengah, bukan hanya laptop developer.

### 7.5 Biaya

Biaya utama kemungkinan berasal dari:
- Audio input/output provider realtime.
- Durasi koneksi dan pemrosesan model.
- Hosting/server gateway.
- Trafik jaringan.
- Lisensi atau biaya engine wake word jika ada.

Sebelum beta, buat simulasi biaya berdasarkan tiga skenario:
1. Penggunaan pribadi ringan.
2. Penggunaan harian sedang.
3. Penggunaan intensif.

Gunakan harga resmi provider saat fase implementasi; jangan mengunci proyeksi biaya dari harga yang belum diverifikasi. Terapkan hard limit, rate limit, dan kontrol penggunaan.

---

## 8. Keamanan, privasi, dan tata kelola

### 8.1 Kontrol keamanan wajib

- Izin mikrofon diminta secara eksplisit.
- Wake-word detection lokal.
- Audio standby tidak dikirim ke cloud.
- Koneksi AI baru dimulai setelah aktivasi.
- Kredensial provider disimpan di server.
- Kredensial sementara memiliki masa berlaku singkat.
- Gateway memverifikasi identitas dan membatasi penggunaan.
- CORS/origin policy dan rate limit diterapkan.
- Tidak ada akses SQL bebas dari model.
- Tidak ada tool administratif pada versi Personal awal.
- Fitur dapat dimatikan melalui feature flag.

### 8.2 Privasi session-only

Session-only berarti aplikasi tidak menyimpan memori percakapan lintas sesi. Hal ini tidak otomatis berarti provider tidak memiliki retensi teknis. Sebelum rilis, dokumentasikan:
- Data apa yang dikirim ke provider.
- Tujuan pemrosesan.
- Kebijakan retensi provider yang berlaku.
- Pengaturan data controls yang tersedia.
- Apakah transkrip/audio digunakan atau tidak untuk peningkatan layanan.
- Cara pengguna mengakhiri sesi dan menghapus state aplikasi.

Hindari klaim “semua data langsung terhapus dari seluruh sistem” kecuali dapat dibuktikan berdasarkan kebijakan dan konfigurasi provider.

### 8.3 Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Wake word salah terdeteksi | Sesi aktif tanpa sengaja | Threshold, uji noise, tombol konfirmasi/fallback |
| Wake word tidak terdeteksi | Pengalaman gagal | Tombol aktivasi manual |
| Tab ditangguhkan | Wake word berhenti | Deteksi status visibility dan jelaskan batas browser |
| Secret bocor | Penyalahgunaan API | Server-side secret, short-lived token, audit |
| Biaya tidak terkendali | Beban biaya | Rate limit, durasi maksimum, usage cap |
| Audio/transkrip tersimpan | Risiko privasi | No-persistence default, audit network/storage |
| Provider/API berubah | Integrasi rusak | Adapter layer, contract tests, dokumentasi versi |
| Kualitas Bahasa Indonesia buruk | Percakapan tidak natural | Uji aksen, prompt tuning, evaluasi voice |
| Browser tidak kompatibel | Fitur tidak tersedia | Compatibility matrix dan fallback |

---

## 9. Pengujian dan acceptance criteria

### 9.1 Functional tests

- Izin mikrofon diterima dan ditolak.
- Wake word terdeteksi dan dapat dinonaktifkan.
- Pengguna dapat memulai dan mengakhiri sesi.
- Audio masuk dan audio keluar berjalan.
- Pengguna dapat menyela respons.
- Pertanyaan lanjutan mempertahankan konteks dalam sesi.
- Sesi baru tidak mewarisi konteks lama.
- Koneksi gagal menampilkan status yang tepat.
- Logout/end session menjalankan cleanup.

### 9.2 Security tests

- Tidak ada provider secret pada bundle frontend.
- Token sementara tidak dapat digunakan setelah kedaluwarsa.
- Endpoint gateway menolak request tidak sah.
- Rate limit berfungsi.
- Tidak ada audio standby yang dikirim.
- Tidak ada transkrip/audio permanen di database/log secara default.
- Tidak ada akses ke modul PINTUKU pada fase Personal awal.

### 9.3 Quality tests

- Uji Bahasa Indonesia formal dan percakapan sehari-hari.
- Uji aksen dan kecepatan bicara yang bervariasi.
- Uji lingkungan tenang dan bising.
- Uji interupsi pada awal, tengah, dan akhir respons.
- Ukur latensi dari akhir ujaran sampai respons audio pertama.
- Uji sesi panjang dan pemulihan koneksi.
- Uji Chrome/Edge desktop terlebih dahulu, lalu browser/perangkat lain berdasarkan prioritas.

### 9.4 Release gate

JARVIS belum boleh dinyatakan siap beta jika:
- Secret provider dapat diakses dari frontend.
- Wake-word engine mengirim audio standby tanpa izin/aktivasi.
- Sesi lama bocor ke sesi baru.
- Penghentian sesi tidak membersihkan resource.
- Biaya belum memiliki pembatasan.
- Kebijakan retensi provider belum ditinjau.
- Fitur mengganggu modul PINTUKU existing.

---

## 10. Pengembangan masa depan setelah JARVIS Personal stabil

Bagian ini adalah arah jangka panjang, bukan komitmen bahwa semua fitur akan dibuat.

### Horizon A — Personal Voice Assistant

Fokus:
- Wake word lokal.
- Percakapan suara natural.
- Interupsi.
- Session-only context.
- Pengaturan persona dan perangkat audio.

### Horizon B — Personal Productivity Assistant

Dapat dipertimbangkan:
- Pengingat dan timer.
- Membantu menyusun agenda.
- Membuat draft dokumen.
- Membaca dokumen yang secara eksplisit diberikan pengguna.
- Integrasi kalender atau layanan produktivitas melalui izin terpisah.

Setiap konektor harus menerapkan otorisasi pengguna dan konfirmasi sebelum tindakan eksternal.

### Horizon C — PINTUKU Intelligence

Setelah tata kelola data dan API modul stabil:
- Membaca ringkasan informasi sekolah sesuai role.
- Menjawab pertanyaan berdasarkan SOP/dokumen yang diizinkan.
- Mengarahkan permintaan ke agen spesialis.
- Menyusun ringkasan lintas modul.
- Menampilkan sumber data dan waktu pembaruan.

### Horizon D — AI Agent Ecosystem

Agen potensial:
- Tata Usaha: administrasi, surat, arsip, disposisi.
- HUMAS: publikasi, dokumentasi, komunikasi.
- Sarpras: inventaris, pemeliharaan, laporan kondisi.
- Kesiswaan: data dan layanan siswa sesuai kewenangan.
- Akademik: analisis pembelajaran dan evaluasi.
- Analitik: ringkasan dan tren operasional.

JARVIS bertindak sebagai orkestrator, bukan superadmin. Setiap agen menggunakan API terbatas dan izin yang sama atau lebih sempit dari pengguna yang meminta.

### Horizon E — Machine Learning dan Predictive Intelligence

ML baru dikembangkan jika tersedia data historis yang cukup, representatif, berkualitas, dan memiliki dasar pemrosesan yang sah.

Contoh kandidat:
- Prediksi kebutuhan pemeliharaan sarpras.
- Analisis tren permintaan layanan administrasi.
- Perkiraan kebutuhan pengadaan.
- Deteksi anomali operasional.

Setiap model harus memiliki baseline, evaluasi akurasi, pemantauan drift, dan human review. Jangan menggunakan prediksi sebagai keputusan otomatis yang berdampak pada siswa atau pegawai.

### Horizon F — Multimodal dan perangkat khusus

Kemungkinan masa depan:
- Memahami gambar/dokumen yang diberikan pengguna.
- OCR dan ekstraksi dokumen.
- Voice assistant pada desktop/kiosk.
- Wake word di background melalui aplikasi khusus, jika dibutuhkan dan disetujui.
- Integrasi perangkat sekolah dengan batas keamanan yang ketat.

Fitur background always-on tidak boleh diasumsikan dapat dicapai hanya dengan web browser.

---

## 11. Kesiapan presentasi kepada pimpinan

JARVIS dapat ditampilkan dalam presentasi PINTUKU sebagai **Future Vision**, bukan fitur yang telah beroperasi.

Narasi yang disarankan:

> “PINTUKU dirancang untuk berkembang dari platform layanan dan administrasi sekolah menuju ekosistem manajemen sekolah cerdas. Salah satu arah pengembangannya adalah JARVIS Personal, asisten digital berbasis percakapan suara yang kelak dapat membantu pengguna berinteraksi secara natural dengan sistem dan informasi yang diizinkan.”

Dalam presentasi, bedakan:
- **Implemented:** sudah tersedia dan dapat didemonstrasikan.
- **In Development:** sedang dibangun dan diuji.
- **Future Vision:** konsep dan roadmap, belum tersedia untuk penggunaan operasional.

Demo visual atau mockup harus diberi label prototype/concept apabila belum terhubung ke AI realtime.

---

## 12. Keputusan yang masih terbuka

Keputusan berikut belum boleh dianggap final sebelum fase discovery:
1. Provider/model realtime final.
2. Engine wake word dan lisensinya.
3. Mekanisme server gateway berdasarkan backend repository aktual.
4. Voice persona dan pilihan suara Bahasa Indonesia.
5. Batas durasi sesi dan inactivity timeout.
6. Target browser/perangkat resmi.
7. Batas biaya per pengguna dan per bulan.
8. Pengaturan retensi provider.
9. Kebijakan transkrip opsional.
10. Mekanisme feature flag dan akses beta.

Keputusan tersebut dicatat sebagai ADR saat implementasi dimulai.

---

## 13. Definition of Done — JARVIS Personal v1

JARVIS Personal v1 dapat dinyatakan selesai jika seluruh kondisi berikut terpenuhi:

- [ ] Dapat dipanggil dengan wake word “JARVIS” pada browser/perangkat yang didukung.
- [ ] Memiliki tombol aktivasi manual sebagai fallback.
- [ ] Mampu memahami percakapan Bahasa Indonesia.
- [ ] Menjawab menggunakan suara natural.
- [ ] Mendukung pertanyaan lanjutan dalam satu sesi.
- [ ] Mendukung interupsi/barge-in.
- [ ] Menampilkan status listening/thinking/speaking dengan akurat.
- [ ] Memiliki kontrol mikrofon dan akhir sesi.
- [ ] Menggunakan kredensial sementara; secret tidak berada di frontend.
- [ ] Tidak mengirim audio standby ke provider.
- [ ] Tidak menyimpan memori lintas sesi.
- [ ] Membersihkan resource dan konteks aplikasi setelah sesi berakhir.
- [ ] Memiliki rate limit, usage cap, dan penanganan error.
- [ ] Lulus functional, security, privacy, dan compatibility tests.
- [ ] Dapat dinonaktifkan tanpa memengaruhi modul PINTUKU lainnya.
- [ ] Tidak mengubah struktur root repository.

---

## 14. Aturan perubahan dokumen dan implementasi

- Dokumen ini adalah baseline spesifikasi JARVIS Personal.
- Perubahan spesifikasi harus memperbarui versi dan bagian keputusan terkait.
- Implementasi tidak dimulai hanya karena dokumen tersedia.
- Prioritas utama tetap penyelesaian modul PINTUKU yang sedang berjalan.
- Setiap fase harus diaudit, diuji, dan ditinjau sebelum melanjutkan fase berikutnya.
- Jangan melakukan refactor root atau memindahkan folder existing untuk mengakomodasi JARVIS.
- Semua fitur masa depan harus kompatibel dengan autentikasi, role, dan batas akses PINTUKU.

**Kesimpulan:** JARVIS Personal dirancang sebagai asisten percakapan suara yang friendly, dipanggil melalui wake word, berjalan di web, dan hanya menyimpan konteks selama sesi aktif. Implementasinya dilakukan bertahap setelah kebutuhan, keamanan, biaya, dan kompatibilitas tervalidasi. PINTUKU tetap menjadi platform utama; JARVIS menjadi lapisan kemampuan tambahan, bukan pengganti arsitektur yang sudah ada.
