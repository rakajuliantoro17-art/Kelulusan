/*******************************************************
 * Sarprasin v2.0
 * Migration Engine
 * Spreadsheet → Firebase
 *******************************************************/

const ASSET_SHEET = "Data Aset";

/* =====================================================
   START MIGRATION
===================================================== */

function startMigration() {

  try {

    logInfo(
      "Migration",
      "Memulai proses migrasi Spreadsheet → Firebase"
    );

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(ASSET_SHEET);

    if (!sheet) {
      throw new Error("Sheet Data Aset tidak ditemukan.");
    }

    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      SpreadsheetApp.getUi().alert("Tidak ada data untuk dimigrasikan.");
      return;
    }

    const headers = data.shift();

    const migrated = [];
    const failed = [];

    data.forEach((row, index) => {

      try {

        const asset = mapAsset(headers, row);

        // ==================================================
        // TODO :
        // Kirim asset ke Firebase
        // menggunakan REST API / Cloud Function
        // ==================================================

        migrated.push(asset.kodeBarang);

      } catch (err) {

        failed.push({
          row: index + 2,
          error: err.toString()
        });

      }

    });

    logSuccess(
      "Migration",
      migrated.length + " data siap dimigrasikan"
    );

    SpreadsheetApp.getUi().alert(
      "Migrasi selesai\n\n" +
      "Berhasil : " + migrated.length +
      "\nGagal : " + failed.length
    );

  } catch (err) {

    logError(
      "Migration",
      err
    );

    SpreadsheetApp.getUi().alert(err.toString());

  }

}

/* =====================================================
   MAPPING DATA
===================================================== */

function mapAsset(headers, row) {

  const get = (name) => {

    const index = headers.indexOf(name);

    return index >= 0 ? row[index] : "";

  };

  return {

    kodeBarang: get("Kode Barang") || get("Kode"),

    namaBarang: get("Nama Barang"),

    kodeRuang: get("Lokasi"),

    kodeKondisi: get("Status"),

    tahun: Number(get("Tahun")) || null,

    kodeSumber: get("Sumber Dana"),

    nilai: Number(get("Nilai")) || 0,

    foto: get("Foto"),

    migratedAt: new Date()

  };

}
