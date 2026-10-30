/*******************************************************
 * Sarprasin v2.0
 * Scheduler Engine
 *******************************************************/

/* =====================================================
   CREATE DAILY BACKUP TRIGGER
===================================================== */

function createDailyBackupTrigger() {

  deleteTriggerByHandler("backupNow");

  ScriptApp.newTrigger("backupNow")
    .timeBased()
    .everyDays(1)
    .atHour(1) // 01.00 WIB
    .create();

  logSuccess(
    "Scheduler",
    "Daily Backup Trigger dibuat."
  );

}

/* =====================================================
   CREATE VALIDATION TRIGGER
===================================================== */

function createValidationTrigger() {

  deleteTriggerByHandler("validateDatabase");

  ScriptApp.newTrigger("validateDatabase")
    .timeBased()
    .everyDays(1)
    .atHour(2)
    .create();

  logSuccess(
    "Scheduler",
    "Validation Trigger dibuat."
  );

}

/* =====================================================
   CREATE REPORT TRIGGER
===================================================== */

function createReportTrigger() {

  deleteTriggerByHandler("generateSummaryReport");

  ScriptApp.newTrigger("generateSummaryReport")
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .create();

  logSuccess(
    "Scheduler",
    "Report Trigger dibuat."
  );

}

/* =====================================================
   CREATE ALL
===================================================== */

function createAllTriggers() {

  createDailyBackupTrigger();

  createValidationTrigger();

  createReportTrigger();

  SpreadsheetApp.getUi().alert(
    "Semua trigger berhasil dibuat."
  );

}

/* =====================================================
   DELETE ALL
===================================================== */

function deleteAllTriggers() {

  const triggers = ScriptApp.getProjectTriggers();

  triggers.forEach(trigger => {

    ScriptApp.deleteTrigger(trigger);

  });

  logWarning(
    "Scheduler",
    "Semua trigger dihapus."
  );

}

/* =====================================================
   DELETE BY FUNCTION
===================================================== */

function deleteTriggerByHandler(handler) {

  const triggers = ScriptApp.getProjectTriggers();

  triggers.forEach(trigger => {

    if (trigger.getHandlerFunction() === handler) {

      ScriptApp.deleteTrigger(trigger);

    }

  });

}

/* =====================================================
   LIST TRIGGERS
===================================================== */

function listTriggers() {

  const triggers = ScriptApp.getProjectTriggers();

  let result = "";

  triggers.forEach(trigger => {

    result +=
      trigger.getHandlerFunction() +
      "\n";

  });

  SpreadsheetApp.getUi().alert(
    result || "Tidak ada trigger."
  );

}
