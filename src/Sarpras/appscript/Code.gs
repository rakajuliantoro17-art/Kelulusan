/*******************************************************
 * =====================================================
 * Sarprasin v2.0
 * Google Apps Script Bootstrap
 * -----------------------------------------------------
 * Fungsi:
 * - Entry Point
 * - Menu Spreadsheet
 * - Health Check
 * - Konfigurasi Awal
 *
 * Database Utama : Firebase Firestore
 * Backup         : Google Spreadsheet
 * Storage        : Firebase Storage
 * Frontend       : Vercel
 * =====================================================
 *******************************************************/

/* =====================================================
   PROJECT INFO
===================================================== */

const APP_NAME = "Sarprasin";
const APP_VERSION = "2.0.0";
const APP_STATUS = "Production";

/* =====================================================
   ON OPEN
===================================================== */

function onOpen() {

  SpreadsheetApp.getUi()
    .createMenu("📦 Sarprasin")
    .addItem("Status Sistem", "showSystemStatus")
    .addSeparator()
    .addItem("Backup Sekarang", "backupNow")
    .addItem("Restore Data", "restoreData")
    .addSeparator()
    .addItem("Validasi Database", "validateDatabase")
    .addItem("Migrasi Spreadsheet → Firebase", "startMigration")
    .addSeparator()
    .addItem("Tentang Sarprasin", "aboutSystem")
    .addToUi();

}

/* =====================================================
   STATUS SISTEM
===================================================== */

function showSystemStatus() {

  const ui = SpreadsheetApp.getUi();

  ui.alert(
      APP_NAME,
      "Versi : " + APP_VERSION +
      "\nStatus : " + APP_STATUS +
      "\nDatabase : Firebase Firestore" +
      "\nBackup : Google Spreadsheet",
      ui.ButtonSet.OK
  );

}

/* =====================================================
   ABOUT
===================================================== */

function aboutSystem() {

  SpreadsheetApp.getUi().alert(
      "Sarprasin v2.0\n" +
      "Smart School Asset Management Platform\n\n" +
      "SMAN 1 Sooko Mojokerto"
  );

}

/* =====================================================
   HEALTH CHECK
===================================================== */

function healthCheck() {

  return {

      status: "OK",

      app: APP_NAME,

      version: APP_VERSION,

      timestamp: new Date()

  };

}
