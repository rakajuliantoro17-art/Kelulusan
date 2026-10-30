/*******************************************************
 * Sarprasin v2.0
 * Synchronization Engine
 *******************************************************/

/* =====================================================
   START SYNC
===================================================== */

function syncNow() {

  try {

    logInfo(
      "Sync",
      "Sinkronisasi dimulai."
    );

    // ============================================
    // TODO :
    // Ambil data terbaru dari Firebase
    // melalui Cloud Function / REST API
    // ============================================

    SpreadsheetApp.getUi().alert(
      "Sinkronisasi berhasil dijalankan."
    );

    logSuccess(
      "Sync",
      "Sinkronisasi selesai."
    );

  } catch(err){

    logError(
      "Sync",
      err
    );

    SpreadsheetApp.getUi().alert(
      err.toString()
    );

  }

}

/* =====================================================
   CHECK LAST SYNC
===================================================== */

function getLastSyncTime() {

  const props = PropertiesService.getScriptProperties();

  return props.getProperty("LAST_SYNC") || "-";

}

/* =====================================================
   UPDATE LAST SYNC
===================================================== */

function updateLastSyncTime() {

  PropertiesService
    .getScriptProperties()
    .setProperty(
      "LAST_SYNC",
      new Date().toISOString()
    );

}

/* =====================================================
   SYNC STATUS
===================================================== */

function syncStatus() {

  SpreadsheetApp.getUi().alert(

    "Sinkronisasi terakhir\n\n" +

    getLastSyncTime()

  );

}
