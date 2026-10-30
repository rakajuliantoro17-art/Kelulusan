/*******************************************************
 * Sarprasin v2.0
 * Report Engine
 *******************************************************/

const REPORT_SHEET = "Laporan";

/* =====================================================
   GENERATE SUMMARY REPORT
===================================================== */

function generateSummaryReport() {

  try {

    logInfo(
      "Report",
      "Generate Summary Report"
    );

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    const assetSheet = ss.getSheetByName("Data Aset");

    if (!assetSheet) {

      throw new Error("Sheet Data Aset tidak ditemukan.");

    }

    const reportSheet = ensureSheet(
      ss,
      REPORT_SHEET,
      [
        "Tanggal",
        "Total Aset",
        "Baik",
        "Perlu Perbaikan",
        "Rusak Berat",
        "Total Nilai"
      ]
    );

    const values = assetSheet.getDataRange().getValues();

    if (values.length <= 1) {

      SpreadsheetApp.getUi().alert("Belum ada data aset.");

      return;

    }

    const header = values.shift();

    const iStatus = header.indexOf("Status");
    const iNilai = header.indexOf("Nilai");

    let total = 0;
    let baik = 0;
    let perbaikan = 0;
    let rusak = 0;
    let totalNilai = 0;

    values.forEach(row => {

      total++;

      const status = row[iStatus];

      if (status === "Baik") baik++;
      else if (status === "Perlu Perbaikan") perbaikan++;
      else if (status === "Rusak Berat") rusak++;

      totalNilai += Number(row[iNilai]) || 0;

    });

    reportSheet.appendRow([

      new Date(),

      total,

      baik,

      perbaikan,

      rusak,

      totalNilai

    ]);

    logSuccess(
      "Report",
      "Summary berhasil dibuat."
    );

    SpreadsheetApp.getUi().alert(
      "Summary Report berhasil dibuat."
    );

  }

  catch(err){

    logError(
      "Report",
      err
    );

    SpreadsheetApp.getUi().alert(err.toString());

  }

}

/* =====================================================
   EXPORT REPORT PDF
===================================================== */

function exportReportPDF() {

  SpreadsheetApp.getUi().alert(
    "Export PDF akan dipindahkan ke aplikasi Firebase (Phase 2)."
  );

}

/* =====================================================
   EXPORT REPORT EXCEL
===================================================== */

function exportReportExcel() {

  SpreadsheetApp.getUi().alert(
    "Spreadsheet sudah menjadi format Excel."
  );

}

/* =====================================================
   REPORT STATUS
===================================================== */

function reportStatus(){

  SpreadsheetApp.getUi().alert(
    "Report Engine aktif."
  );

}
