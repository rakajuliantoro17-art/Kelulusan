/**
 * SARPRASIN 2.0 - Sinkron akun <-> Google Spreadsheet
 *
 * Tempel di spreadsheet: Ekstensi -> Apps Script. Lihat docs/sinkron-spreadsheet.md.
 *
 * Properti Skrip (Project Settings -> Script properties):
 *   FIREBASE_API_KEY     = nilai VITE_FIREBASE_API_KEY
 *   FIREBASE_PROJECT_ID  = nilai VITE_FIREBASE_PROJECT_ID
 *
 * Keamanan: setiap permintaan wajib membawa ID token Firebase. Skrip
 * memverifikasinya ke Google, lalu membaca users/{uid} dengan token itu dan
 * hanya mengizinkan role "admin" yang aktif. Password TIDAK pernah ditulis ke sheet.
 *
 * Sheet yang dipakai:
 *   "Akun"         : antrean impor (Nama, Email, Role, Password, Ruangan)
 *   "Daftar Akun"  : salinan akun terkini dari aplikasi (ditimpa tiap sinkron)
 *   "Riwayat Impor": catatan hasil impor (tanpa password)
 */

var SHEET_IMPOR = 'Akun';
var SHEET_DAFTAR = 'Daftar Akun';
var SHEET_RIWAYAT = 'Riwayat Impor';
var MAKS_BARIS = 200;

function doGet() {
  return json_({ ok: true, pesan: 'Sinkron akun SARPRASIN aktif' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var req = JSON.parse(e.postData.contents);
    var admin = verifyAdmin_(req.idToken);

    switch (req.action) {
      case 'ping':   return json_({ ok: true, admin: admin });
      case 'export': return json_(exportDaftar_(req.rows));
      case 'pull':   return json_(pull_());
      case 'done':   return json_(done_(req.items));
    }
    return json_({ ok: false, error: 'Aksi tidak dikenal' });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/* ---------- verifikasi admin ---------- */

function verifyAdmin_(idToken) {
  if (!idToken) throw new Error('Tidak ada token login.');
  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty('FIREBASE_API_KEY');
  var pid = props.getProperty('FIREBASE_PROJECT_ID');
  if (!key || !pid) throw new Error('FIREBASE_API_KEY / FIREBASE_PROJECT_ID belum diisi di Script properties.');

  var look = UrlFetchApp.fetch(
    'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + encodeURIComponent(key),
    { method: 'post', contentType: 'application/json', payload: JSON.stringify({ idToken: idToken }), muteHttpExceptions: true }
  );
  if (look.getResponseCode() !== 200) throw new Error('Token login tidak valid atau kedaluwarsa.');
  var user = (JSON.parse(look.getContentText()).users || [])[0];
  if (!user) throw new Error('Akun tidak ditemukan.');

  var doc = UrlFetchApp.fetch(
    'https://firestore.googleapis.com/v1/projects/' + pid + '/databases/(default)/documents/users/' + user.localId,
    { headers: { Authorization: 'Bearer ' + idToken }, muteHttpExceptions: true }
  );
  if (doc.getResponseCode() !== 200) throw new Error('Profil pengguna tidak ditemukan.');
  var f = JSON.parse(doc.getContentText()).fields || {};
  var role = f.role && f.role.stringValue;
  var status = (f.status && f.status.stringValue) || 'aktif';
  if (role !== 'admin' || status === 'nonaktif') throw new Error('Hanya admin aktif yang boleh menyinkronkan.');
  return user.email || user.localId;
}

/* ---------- aksi ---------- */

function sheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

/** Aplikasi -> sheet: tulis ulang "Daftar Akun". rows[0] = judul kolom. */
function exportDaftar_(rows) {
  if (!rows || !rows.length) throw new Error('Tidak ada data untuk ditulis.');
  var sh = sheet_(SHEET_DAFTAR);
  sh.clear();
  var width = rows[0].length;
  var data = rows.map(function (r) { return r.map(function (c) { return c == null ? '' : String(c); }); });
  sh.getRange(1, 1, data.length, width).setValues(data);
  sh.getRange(1, 1, 1, width).setFontWeight('bold').setBackground('#2563eb').setFontColor('#ffffff');
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, width);
  sh.getRange(1, width + 2).setValue('Terakhir sinkron: ' + new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
  return { ok: true, baris: data.length - 1 };
}

/** Sheet -> aplikasi: kirim isi sheet "Akun" apa adanya (aplikasi yang memvalidasi). */
function pull_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_IMPOR);
  if (!sh) throw new Error('Sheet "' + SHEET_IMPOR + '" tidak ditemukan. Ganti nama tab impor menjadi "Akun".');
  var values = sh.getDataRange().getValues().map(function (r) {
    return r.map(function (c) { return c == null ? '' : String(c); });
  });
  if (values.length - 1 > MAKS_BARIS) throw new Error('Maksimal ' + MAKS_BARIS + ' baris per tarikan.');
  return { ok: true, rows: values };
}

/** Setelah impor: hapus baris yang berhasil dibuat dari "Akun" + catat riwayat. */
function done_(items) {
  items = items || [];
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_IMPOR);
  var hist = sheet_(SHEET_RIWAYAT);
  if (hist.getLastRow() === 0) {
    hist.appendRow(['Waktu', 'Nama', 'Email', 'Role', 'Ruangan', 'Hasil']);
    hist.getRange(1, 1, 1, 6).setFontWeight('bold');
    hist.setFrozenRows(1);
  }
  var now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  var okEmails = {};
  items.forEach(function (it) {
    hist.appendRow([now, it.name || '', it.email || '', it.role || '', it.ruangan || '', it.ok ? 'Dibuat' : (it.error || 'Dilewati')]);
    if (it.ok) okEmails[String(it.email).toLowerCase()] = true;
  });

  var hapus = 0;
  if (sh) {
    var values = sh.getDataRange().getValues();
    var head = values[0].map(function (c) { return String(c).toLowerCase().trim(); });
    var col = head.indexOf('email');
    if (col >= 0) {
      for (var i = values.length - 1; i >= 1; i--) {
        if (okEmails[String(values[i][col]).toLowerCase().trim()]) { sh.deleteRow(i + 1); hapus++; }
      }
    }
  }
  return { ok: true, dicatat: items.length, dihapusDariAntrean: hapus };
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
