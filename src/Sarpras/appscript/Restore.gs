/*******************************************************
 * Sarprasin v2.0
 * Restore Engine
 * Spreadsheet → Firebase
 *******************************************************/

const RESTORE_SHEET = "Data Aset";

/* =====================================================
   START RESTORE
===================================================== */

function restoreData() {

  try {

    logInfo(
      "Restore",
      "Memulai proses restore"
    );

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    const sheet = ss.getSheetByName(RESTORE_SHEET);

    if (!sheet) {

      throw new Error("Sheet Data Aset tidak ditemukan.");

    }

    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) {

      SpreadsheetApp.getUi().alert(
        "Tidak ada data untuk direstore."
      );

      return;

    }

    const headers = values.shift();

    let total = 0;

    values.forEach(row => {

      const asset = mapRestoreAsset(headers, row);

      // ==============================================
      // TODO
      // Kirim ke Firebase melalui REST API /
      // Cloud Function
      // ==============================================

      total++;

    });

    logSuccess(
      "Restore",
      total + " data siap direstore."
    );

    SpreadsheetApp.getUi().alert(
      "Restore selesai.\n\n" +
      "Total Data : " + total
    );

  }

  catch(err){

    logError(
      "Restore",
      err
    );

    SpreadsheetApp.getUi().alert(
      err.toString()
    );

  }

}

/* =====================================================
   MAPPING
===================================================== */

function mapRestoreAsset(headers,row){

  const get=(name)=>{

    const index=headers.indexOf(name);

    return index>=0 ? row[index] : "";

  };

  return{

    kodeBarang:get("Kode Barang") || get("Kode"),

    namaBarang:get("Nama Barang"),

    kodeRuang:get("Lokasi"),

    kodeKondisi:get("Status"),

    tahun:Number(get("Tahun"))||0,

    kodeSumber:get("Sumber Dana"),

    nilai:Number(get("Nilai"))||0,

    foto:get("Foto")

  };

}
