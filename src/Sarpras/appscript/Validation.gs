/*******************************************************
 * Sarprasin v2.0
 * Validation Engine
 *******************************************************/

const VALIDATION_SHEET = "Validation Report";

/* =====================================================
   VALIDATE DATABASE
===================================================== */

function validateDatabase() {

  try {

    logInfo(
      "Validation",
      "Validasi database dimulai."
    );

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("Data Aset");

    if (!sheet) {
      throw new Error("Sheet Data Aset tidak ditemukan.");
    }

    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) {
      SpreadsheetApp.getUi().alert("Belum ada data.");
      return;
    }

    const headers = values.shift();

    const report = [];

    values.forEach((row, index) => {

      const result = validateAsset(headers, row);

      if (!result.valid) {

        report.push([
          index + 2,
          result.kode,
          result.message
        ]);

      }

    });

    saveValidationReport(ss, report);

    SpreadsheetApp.getUi().alert(
      "Validasi selesai.\n\n" +
      "Temuan : " + report.length
    );

    logSuccess(
      "Validation",
      report.length + " temuan."
    );

  }

  catch(err){

    logError(
      "Validation",
      err
    );

    SpreadsheetApp.getUi().alert(err.toString());

  }

}

/* =====================================================
   VALIDATE SINGLE ASSET
===================================================== */

function validateAsset(headers,row){

  const get=(name)=>{

    const index=headers.indexOf(name);

    return index>=0 ? row[index] : "";

  };

  const kode=get("Kode Barang") || get("Kode");

  if(!kode){

    return{
      valid:false,
      kode:"",
      message:"Kode Barang kosong."
    };

  }

  if(!get("Nama Barang")){

    return{
      valid:false,
      kode:kode,
      message:"Nama Barang kosong."
    };

  }

  if(!get("Lokasi")){

    return{
      valid:false,
      kode:kode,
      message:"Lokasi kosong."
    };

  }

  if(!get("Status")){

    return{
      valid:false,
      kode:kode,
      message:"Status kosong."
    };

  }

  if(Number(get("Nilai"))<0){

    return{
      valid:false,
      kode:kode,
      message:"Nilai tidak valid."
    };

  }

  return{

    valid:true

  };

}

/* =====================================================
   SAVE REPORT
===================================================== */

function saveValidationReport(ss,report){

  const sheet=ensureSheet(

    ss,

    VALIDATION_SHEET,

    [

      "Baris",

      "Kode Barang",

      "Masalah"

    ]

  );

  sheet.clearContents();

  sheet.appendRow([

    "Baris",

    "Kode Barang",

    "Masalah"

  ]);

  if(report.length){

    sheet

    .getRange(

      2,

      1,

      report.length,

      report[0].length

    )

    .setValues(report);

  }

}
