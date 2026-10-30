/*
==========================================================
Sarprasin 2.0
Excel Import Service
File : src/services/import/excel.service.js
Version : 2.0.0
==========================================================
*/

import * as XLSX from "xlsx";

class ExcelImportService {

    /* ==========================================
       READ FILE
    ========================================== */

    async read(file) {

        return new Promise((resolve, reject) => {

            const reader = new FileReader();

            reader.onload = event => {

                try {

                    const workbook = XLSX.read(

                        event.target.result,

                        {

                            type: "array"

                        }

                    );

                    resolve(workbook);

                }

                catch (error) {

                    reject(error);

                }

            };

            reader.onerror = reject;

            reader.readAsArrayBuffer(file);

        });

    }

    /* ==========================================
       SHEET NAMES
    ========================================== */

    getSheetNames(workbook) {

        return workbook.SheetNames;

    }

    /* ==========================================
       GET SHEET
    ========================================== */

    getSheet(

        workbook,

        sheetName

    ) {

        return workbook.Sheets[sheetName];

    }

    /* ==========================================
       SHEET → JSON
    ========================================== */

    toJson(

        workbook,

        sheetName

    ) {

        const sheet = this.getSheet(

            workbook,

            sheetName

        );

        return XLSX.utils.sheet_to_json(

            sheet,

            {

                defval: ""

            }

        );

    }

    /* ==========================================
       FIRST SHEET
    ========================================== */

    firstSheet(workbook) {

        return workbook.SheetNames[0];

    }

    /* ==========================================
       PREVIEW
    ========================================== */

    preview(

        data = [],

        limit = 10

    ) {

        return data.slice(0, limit);

    }

    /* ==========================================
       ROW COUNT
    ========================================== */

    count(data = []) {

        return data.length;

    }

    /* ==========================================
       HEADERS
    ========================================== */

    headers(data = []) {

        if (!data.length) {

            return [];

        }

        return Object.keys(data[0]);

    }

}

const excelImportService =

    new ExcelImportService();

export default excelImportService;

export {

    ExcelImportService

};
