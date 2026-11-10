(() => {
"use strict";
/* Terjemahan ID↔EN untuk halaman kerja & login Sarpras. Hanya teks antarmuka; data dari spreadsheet tidak diterjemahkan. */
if(document.body.dataset.i18nScope!=="sarpras")return;
const P=[
 ["Dashboard Operasional Sarpras","Sarpras Operations Dashboard"],
 ["SARPRASIN · SMAN 1 Sooko · ADMIN / STAFF","SARPRASIN · SMAN 1 Sooko · ADMIN / STAFF"],
 ["Pusat kendali inventaris, ruangan, pemeliharaan, pengadaan, dan administrasi aset sekolah.","Control center for inventory, rooms, maintenance, procurement, and school asset administration."],
 ["PRATINJAU UI · BELUM TERHUBUNG DATA","UI PREVIEW · NOT CONNECTED TO DATA"],
 ["TERHUBUNG · GOOGLE SHEETS","CONNECTED · GOOGLE SHEETS"],
 ["Total aset","Total assets"],["Menunggu sumber data","Waiting for data source"],["Ruangan","Rooms"],
 ["Perlu pemeliharaan","Needs maintenance"],["Usulan / pengadaan","Requests / procurement"],
 ["Akses cepat operasional","Operational shortcuts"],["Rancangan pintasan modul kerja staf Sarpras.","Draft shortcuts to Sarpras staff work modules."],
 ["Inventaris aset","Asset inventory"],["Data barang dan identitas aset","Item data and asset identity"],
 ["Bangunan & ruangan","Buildings & rooms"],["Data lokasi dan fasilitas","Location and facility data"],
 ["Pemeliharaan","Maintenance"],["Jadwal dan riwayat perawatan","Maintenance schedule and history"],
 ["Pengadaan","Procurement"],["Usulan dan tindak lanjut kebutuhan","Requests and follow-up of needs"],
 ["Audit & QR","Audit & QR"],["Verifikasi data inventaris","Inventory data verification"],
 ["Laporan","Reports"],["Rekap dan dokumen aset","Asset summaries and documents"],
 ["Aktivitas terbaru","Recent activity"],["Area aktivitas akan menampilkan perubahan data setelah integrasi backend.","This area will show data changes after backend integration."],
 ["Lima aktivitas terakhir dari tab Log_Aktivitas.","The last five activities from the Log_Aktivitas tab."],
 ["Belum ada aktivitas yang ditampilkan.","No activity to show yet."],["Data aktivitas belum dihubungkan.","Activity data is not connected yet."],
 ["Perhatian operasional","Operational attention"],["Ringkasan tindak lanjut.","Follow-up summary."],
 ["Validasi inventaris","Inventory validation"],["Belum tersedia","Not yet available"],["Jadwal pemeliharaan","Maintenance schedule"],["Usulan kebutuhan","Needs requests"],
 ["Mode pengembangan UI.","UI development mode."],
 ["← Kembali ke portal publik Sarpras","← Back to the Sarpras public portal"],
 ["Executive Overview","Executive Overview"],["SARPRASIN · SMAN 1 Sooko · EKSEKUTIF","SARPRASIN · SMAN 1 Sooko · EXECUTIVE"],
 ["Dashboard analitik pimpinan untuk memantau nilai aset, kesehatan fasilitas, anggaran, risiko, tren, dan rekomendasi strategis.","Leadership analytics dashboard to monitor asset value, facility health, budget, risk, trends, and strategic recommendations."],
 ["Inventaris tervalidasi","Validated inventory"],["Nilai aset tercatat","Recorded asset value"],["Agregat nilai perolehan","Aggregate acquisition value"],
 ["Indeks kesehatan aset","Asset health index"],["Aset perlu penanganan","Assets needing attention"],["Perbaikan dan rusak","Repair and damaged"],
 ["Tren kondisi aset","Asset condition trend"],["Perubahan indeks kelayakan dan komposisi kondisi aset berdasarkan periode pelaporan.","Changes in the fitness index and asset condition composition by reporting period."],
 ["Grafik tren kondisi aset","Asset condition trend chart"],["Menunggu data historis tervalidasi.","Waiting for validated historical data."],
 ["Kesehatan & risiko aset","Asset health & risk"],["Distribusi aset berdasarkan kondisi dan tingkat urgensi penanganan.","Asset distribution by condition and handling urgency."],
 ["Kondisi baik","Good condition"],["Perlu perbaikan","Needs repair"],["Rusak","Damaged"],["Indeks kelayakan","Fitness index"],
 ["Komposisi & sebaran aset","Asset composition & distribution"],["Ringkasan aset menurut kategori, ruang, dan tahun perolehan.","Asset summary by category, room, and acquisition year."],
 ["Grafik kategori, ruang, dan tahun perolehan","Chart by category, room, and acquisition year"],["Menunggu master data inventaris.","Waiting for inventory master data."],
 ["Anggaran & sumber pendanaan","Budget & funding sources"],["Keterlacakan nilai aset dan sumber dukungan.","Traceability of asset value and funding support."],
 ["Belanja pemeliharaan","Maintenance spending"],["Sumber pendanaan","Funding sources"],["Periode anggaran","Budget period"],
 ["Prioritas & rekomendasi strategis","Priorities & strategic recommendations"],["Rekomendasi disusun dari kondisi aktual, tingkat risiko, urgensi layanan, dan estimasi kebutuhan biaya.","Recommendations are drawn from actual condition, risk level, service urgency, and estimated cost needs."],
 ["Rekomendasi belum tersedia — menunggu data tervalidasi dan parameter prioritas yang disepakati.","Recommendations are not yet available — waiting for validated data and agreed priority parameters."],
 ["← Kembali ke dashboard publik Sarpras","← Back to the Sarpras public dashboard"],
 ["SARPRASIN · SMAN 1 Sooko · GURU & SISWA","SARPRASIN · SMAN 1 Sooko · TEACHERS & STUDENTS"],
 ["Layanan Sarana dan Prasarana","Facilities and Infrastructure Services"],
 ["Ruang informasi fasilitas sekolah dan rancangan layanan untuk menyampaikan kebutuhan atau kondisi sarana.","Information space on school facilities and a draft service for reporting facility needs or conditions."],
 ["Informasi fasilitas","Facility information"],["Ruang","Room"],["Informasi umum sekolah","General school information"],
 ["Inventaris kelas","Classroom inventory"],["Kelas","Class"],["Akan tersedia setelah integrasi","Available after integration"],
 ["Pelaporan","Reporting"],["Aspirasi","Aspiration"],["Rancangan layanan","Draft service"],["Status laporan","Report status"],["Belum ada data terhubung","No connected data yet"],
 ["Kenali ruang dan fasilitas sekolah","Get to know school rooms and facilities"],["Inventaris ruang","Room inventory"],["Rancangan tampilan barang per ruang","Draft view of items per room"],
 ["Laporkan kerusakan","Report damage"],["Form pelaporan akan diaktifkan pada tahap berikutnya","The report form will be enabled in the next stage"],
 ["Informasi fasilitas sekolah","School facility information"],["Daftar fasilitas yang nantinya dapat ditelusuri berdasarkan lokasi.","A list of facilities that can later be browsed by location."],
 ["Ruang kelas","Classrooms"],["Data belum tersedia","Data not yet available"],["Laboratorium","Laboratory"],["Perpustakaan","Library"],["Fasilitas umum","Public facilities"],
 ["Pelaporan sarana","Facility reporting"],["Alur pelaporan yang direncanakan.","The planned reporting flow."],
 ["Pilih fasilitas → jelaskan kondisi → kirim laporan → pantau tindak lanjut.","Choose a facility → describe the condition → submit the report → track follow-up."],["Form belum aktif.","The form is not active yet."],
 ["Sarana & Prasarana","Facilities & Infrastructure"],["Masuk Sarpras.","Sign in to Sarpras."],
 ["Masuk menggunakan akun yang diaktifkan oleh administrator Sarpras.","Sign in with an account activated by the Sarpras administrator."],
 ["Username akun","Account username"],["Kata sandi","Password"],["Tampilkan","Show"],["Sembunyikan","Hide"],["Masuk","Sign in"],
 ["Sesi diverifikasi server melalui token bertanda tangan. Akses mengikuti peran pada tab Pengguna di spreadsheet Sarpras.","Sessions are verified by the server through signed tokens. Access follows the role on the Pengguna tab of the Sarpras spreadsheet."],
 ["Memverifikasi akun…","Verifying account…"],
 ["Username atau kata sandi salah, atau akun tidak aktif.","Wrong username or password, or the account is inactive."],
 ["Terlalu banyak percobaan gagal. Coba kembali dalam 10 menit.","Too many failed attempts. Try again in 10 minutes."],
 ["Username dan kata sandi wajib diisi.","Username and password are required."],
 ["Peran akun belum dikenali. Periksa kolom Peran pada tab Pengguna.","Account role not recognized. Check the Peran column on the Pengguna tab."],
 ["Data akun Sarpras tidak dapat dibaca. Periksa akses Viewer Service Account pada spreadsheet.","Sarpras account data cannot be read. Check the Service Account Viewer access on the spreadsheet."],
 ["Tidak dapat menghubungi layanan autentikasi. Periksa koneksi dan coba kembali.","Cannot reach the authentication service. Check your connection and try again."],
 // shell
 ["SARPRASIN — Portal Sarana dan Prasarana SMAN 1 Sooko","SARPRASIN — Facilities and Infrastructure Portal, SMAN 1 Sooko"],
 ["Operasional","Operations"],["Eksekutif","Executive"],["Layanan","Services"],["Publik","Public"],
 ["Dashboard Operasional","Operations Dashboard"],["Layanan Guru & Siswa","Teacher & Student Services"],
 ["Portal Publik Sarpras","Sarpras Public Portal"],["Kembali ke PINTUKU","Back to PINTUKU"],["Lainnya","More"],["Keluar","Sign out"],
 ["Admin Sarpras","Sarpras Admin"],["Staff Sarpras","Sarpras Staff"],["Arsiparis","Archivist"],["Wakasek Sarpras","Deputy Head, Facilities"],["Kepala Sekolah","Principal"],["Operator","Operator"],["Guru","Teacher"],["Wali Kelas","Homeroom Teacher"],
 // settings drawer
 ["Pengaturan","Settings"],["Mode tampilan","Display theme"],["Beralih antara terang dan gelap","Switch between light and dark"],
 ["Pilihan tema disimpan di perangkat ini dan berlaku di seluruh halaman portal.","Theme preference is saved on this device and applies across the portal."],
 ["Pilih bahasa antarmuka","Choose interface language"],
 ["Bahasa antarmuka dapat diubah kapan saja. Dokumen resmi tetap mengikuti bahasa dokumen sumber.","The interface language can be changed at any time. Official documents remain in their source language."],
 // Admin/Staff inventory workspace
 ["Data Aset","Asset Data"],["Inventaris yang terbaca dari tab Aset pada Google Sheets.","Inventory read from the Aset tab in Google Sheets."],
 ["Memuat…","Loading…"],["Cari aset","Search assets"],["Nama, kode, merk, lokasi…","Name, code, brand, location…"],
 ["Semua kondisi","All conditions"],["Perlu perbaikan","Needs repair"],["Belum dipetakan","Not mapped"],
 ["Kode","Code"],["Nama aset","Asset name"],["Model","Model"],["Jumlah","Quantity"],["Lokasi","Location"],["Tahun","Year"],["Nilai","Value"],["Verifikasi","Verification"],
 ["Menghubungkan ke spreadsheet…","Connecting to spreadsheet…"],["Belum ada data ditampilkan.","No data to display yet."],
 ["Sumber: tab Aset · menampilkan maksimal 500 baris. Data tidak diubah.","Source: Aset tab · displaying up to 500 rows. No data has been changed."],
 ["Pembelian & Pengadaan","Purchases & Procurement"],["Input pembelian baru dan pembentukan aset akan diaktifkan setelah skema Pembelian dan Aset diselaraskan.","New purchase entry and asset creation will be enabled after the Purchases and Assets schemas are aligned."],
 ["Input pembelian","Purchase entry"],["Menunggu integrasi transaksi dan verifikasi.","Waiting for transaction integration and verification."],
 ["Mutasi Aset","Asset Movement"],["Pindah lokasi antar-ruang, laboratorium, kantor, dan gudang.","Move assets between rooms, laboratories, offices, and warehouses."],
 ["Form mutasi","Movement form"],["Mutasi menyimpan asal, tujuan, kuantitas, alasan, pelaksana, dan waktu. Belum aktif.","Movements will record source, destination, quantity, reason, operator, and time. Not active yet."],
 ["Lokasi & Gudang","Locations & Warehouse"],["Master ruang belajar, laboratorium, kantor, fasilitas umum, dan gudang.","Master list of classrooms, laboratories, offices, public facilities, and warehouses."],
 ["Master lokasi","Location master"],["Menunggu pemetaan kode lokasi dan nama lokasi terkini.","Waiting for location-code and current location-name mapping."],
 ["Impor XLSX / CSV","XLSX / CSV Import"],["File diproses secara lokal untuk pratinjau. Tidak ada baris yang ditulis ke spreadsheet.","Files are processed locally for preview. No rows are written to the spreadsheet."],
 ["Pilih file inventaris","Choose inventory file"],["Belum ada file dipilih.","No file selected."],["Sheet","Sheet"],["Penulisan belum diaktifkan","Writing is not enabled"],
 ["Riwayat aktivitas","Activity History"],["Aktivitas terbaru dari tab Log_Aktivitas. Riwayat aset dan mutasi append-only disiapkan pada tahap integrasi berikutnya.","Recent activity from Log_Aktivitas. Append-only asset and movement history will be added in the next integration stage."],
 ["Menunggu data aktivitas…","Waiting for activity data…"],["Perhatian operasional","Operational Attention"],
 ["Ringkasan tindak lanjut akan muncul setelah data kondisi dan pemeliharaan tervalidasi.","Follow-up summaries will appear after condition and maintenance data are validated."],
 ["Menunggu pemeriksaan","Awaiting inspection"],["Belum terhubung","Not connected"],
 ["Data aset dibaca dari Google Sheets. Fitur tulis, pembelian, mutasi, dan impor belum diaktifkan. Workbook BPOPP 2025 merupakan catatan pengadaan historis, bukan inventaris aktif terverifikasi.","Asset data is read from Google Sheets. Writing, purchases, movements, and imports are not enabled. The 2025 BPOPP workbook is procurement history, not a verified active inventory."]
];
const toEn=new Map(P),toId=new Map(P.map(([a,b])=>[b,a]));
// pola dinamis [id-regex, en-template, en-regex, id-template]
const R=[
 [/^(\d[\d.,]*) catatan inventaris$/,"$1 inventory records",/^(\d[\d.,]*) inventory records$/,"$1 catatan inventaris"],
 [/^(\d[\d.,]*) aset belum berkode ruang$/,"$1 assets without a room code",/^(\d[\d.,]*) assets without a room code$/,"$1 aset belum berkode ruang"],
 [/^Seluruh aset berkode ruang$/,"All assets have a room code",/^All assets have a room code$/,"Seluruh aset berkode ruang"],
 [/^Rusak ringan (\d+) · rusak berat (\d+)$/,"Minor damage $1 · major damage $2",/^Minor damage (\d+) · major damage (\d+)$/,"Rusak ringan $1 · rusak berat $2"],
 [/^(\d[\d.,]*) unit \((.+)\)$/,"$1 units ($2)",/^(\d[\d.,]*) units \((.+)\)$/,"$1 unit ($2)"],
 [/^(\d[\d.,]*) unit$/,"$1 units",/^(\d[\d.,]*) units$/,"$1 unit"],
 [/^Kategori · (.+)$/,"Category · $1",/^Category · (.+)$/,"Kategori · $1"],
 [/^Ruang · (.+)$/,"Room · $1",/^Room · (.+)$/,"Ruang · $1"],
 [/^Tahun · (.+)$/,"Year · $1",/^Year · (.+)$/,"Tahun · $1"],
 [/^(\d+) sumber · terbesar (.+)$/,"$1 sources · largest $2",/^(\d+) sources · largest (.+)$/,"$1 sumber · terbesar $2"],
 [/^Sumber: (.+) · diperbarui (.+)\. Angka dihitung dari tab Aset dan Ruangan; Jumlah kosong dihitung 1 unit per baris\. · Mode baca saja: tambah, edit, mutasi, dan impor belum menulis data\.$/,"Source: $1 · updated $2. Figures are computed from the Aset and Ruangan tabs; an empty Jumlah counts as 1 unit per row. · Read-only mode: add, edit, move, and import do not write data.",/^Source: (.+) · updated (.+)\. Figures are computed from the Aset and Ruangan tabs; an empty Jumlah counts as 1 unit per row\. · Read-only mode: add, edit, move, and import do not write data\.$/,"Sumber: $1 · diperbarui $2. Angka dihitung dari tab Aset dan Ruangan; Jumlah kosong dihitung 1 unit per baris. · Mode baca saja: tambah, edit, mutasi, dan impor belum menulis data."],
 [/^Sumber: (.+) · diperbarui (.+)\. Angka dihitung dari tab Aset dan Ruangan; Jumlah kosong dihitung 1 unit per baris\.$/,"Source: $1 · updated $2. Figures are computed from the Aset and Ruangan tabs; an empty Jumlah counts as 1 unit per row.",/^Source: (.+) · updated (.+)\. Figures are computed from the Aset and Ruangan tabs; an empty Jumlah counts as 1 unit per row\.$/,"Sumber: $1 · diperbarui $2. Angka dihitung dari tab Aset dan Ruangan; Jumlah kosong dihitung 1 unit per baris."],
 [/^Data dari spreadsheet belum dapat dimuat: (.+)$/,"Spreadsheet data could not be loaded: $1",/^Spreadsheet data could not be loaded: (.+)$/,"Data dari spreadsheet belum dapat dimuat: $1"],
 [/^Angka, tabel, dan aktivitas operasional belum terhubung ke sumber data\. Fitur transaksi dan autentikasi belum diaktifkan pada tahap ini\.$/,"Operational figures, tables, and activity are not yet connected to a data source. Transaction features and authentication are not enabled at this stage.",/^Operational figures, tables, and activity are not yet connected to a data source\. Transaction features and authentication are not enabled at this stage\.$/,"Angka, tabel, dan aktivitas operasional belum terhubung ke sumber data. Fitur transaksi dan autentikasi belum diaktifkan pada tahap ini."]
];
const attrs=["aria-label","title","placeholder"];
let busy=false;
function tr(text,lang){
 const m=lang==="en"?toEn:toId;
 if(m.has(text))return m.get(text);
 for(const r of R){const [re,out]=lang==="en"?[r[0],r[1]]:[r[2],r[3]];if(re.test(text))return text.replace(re,out);}
 return null;
}
function translate(){
 if(busy)return;busy=true;
 const lang=document.documentElement.lang==="en"?"en":"id";
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 let n;while((n=walker.nextNode())){
  const p=n.parentElement;if(!p||/^(SCRIPT|STYLE|NOSCRIPT)$/.test(p.tagName))continue;
  const raw=n.nodeValue,t=raw.trim();if(!t)continue;
  const out=tr(t,lang);if(out!==null&&out!==t)n.nodeValue=raw.replace(t,out);
 }
 for(const a of attrs)document.querySelectorAll("["+a+"]").forEach(el=>{const v=el.getAttribute(a),out=tr(v,lang);if(out!==null&&out!==v)el.setAttribute(a,out);});
 busy=false;
}
window.sarprasI18n=Object.freeze({toEnglish:t=>tr(t,"en")});
document.addEventListener("pintuku:languagechange",translate);
new MutationObserver(()=>{if(!busy)translate();}).observe(document.body,{childList:true,subtree:true});
translate();
})();
