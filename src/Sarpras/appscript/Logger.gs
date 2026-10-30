/*******************************************************
 * Sarprasin v2.0
 * Logger Engine
 *******************************************************/

const LOG_SHEET_NAME = "Log Aktivitas";

/* =====================================================
   TULIS LOG
===================================================== */

function writeLog(action, status, user, detail) {

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const sheet = ensureSheet(
    ss,
    LOG_SHEET_NAME,
    [
      "Timestamp",
      "Action",
      "Status",
      "User",
      "Detail"
    ]
  );

  sheet.appendRow([
    new Date(),
    action || "-",
    status || "SUCCESS",
    user || "SYSTEM",
    detail || ""
  ]);

}

/* =====================================================
   INFO
===================================================== */

function logInfo(action, detail = "", user = "SYSTEM") {

  writeLog(
    action,
    "INFO",
    user,
    detail
  );

}

/* =====================================================
   SUCCESS
===================================================== */

function logSuccess(action, detail = "", user = "SYSTEM") {

  writeLog(
    action,
    "SUCCESS",
    user,
    detail
  );

}

/* =====================================================
   WARNING
===================================================== */

function logWarning(action, detail = "", user = "SYSTEM") {

  writeLog(
    action,
    "WARNING",
    user,
    detail
  );

}

/* =====================================================
   ERROR
===================================================== */

function logError(action, error, user = "SYSTEM") {

  writeLog(
    action,
    "ERROR",
    user,
    error.toString()
  );

}

/* =====================================================
   CLEAR LOG
===================================================== */

function clearLog() {

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const sheet = ss.getSheetByName(LOG_SHEET_NAME);

  if (!sheet) return;

  sheet.clearContents();

  sheet.appendRow([
    "Timestamp",
    "Action",
    "Status",
    "User",
    "Detail"
  ]);

}
