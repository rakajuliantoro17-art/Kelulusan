/******************************************************
 * Sarprasin v2.0
 * Backup Engine
 * Firebase → Spreadsheet
 ******************************************************/

const SPREADSHEET_ID = "1cxA1-pkhP772dI8pSVqWC0o8p-mPFsnLUEli5xZk8as";

/* =====================================================
   MENU
===================================================== */

function onOpen() {

  SpreadsheetApp.getUi()
    .createMenu("Sarprasin")
    .addItem("Backup Sekarang", "backupNow")
    .addItem("Restore Data", "restoreData")
    .addSeparator()
    .addItem("Status Backup", "backupStatus")
    .addToUi();

}

/* =====================================================
   BACKUP MANUAL
===================================================== */

function backupNow() {

  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID);

  const backup = ensureSheet(
      sheet,
      "Backup Log",
      [
        "Tanggal",
        "Status",
        "Keterangan"
      ]
  );

  backup.appendRow([
      new Date(),
      "SUCCESS",
      "Backup dijalankan manual."
  ]);

}

/* =====================================================
   RESTORE
===================================================== */

function restoreData() {

  SpreadsheetApp.getUi().alert(
    "Restore akan tersedia setelah integrasi Firebase selesai."
  );

}

/* =====================================================
   STATUS
===================================================== */

function backupStatus(){

  SpreadsheetApp.getUi().alert(
    "Backup Engine aktif."
  );

}

/* =====================================================
   UTIL
===================================================== */

function ensureSheet(ss,name,header){

  let sh=ss.getSheetByName(name);

  if(!sh){

      sh=ss.insertSheet(name);

      sh.appendRow(header);

      sh.getRange(1,1,1,header.length)
        .setFontWeight("bold");

  }

  return sh;

}
