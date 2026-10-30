/*
==========================================================
Sarprasin 2.0
Excel Export Service
File : src/services/export/excel.service.js
Version : 2.0.0
==========================================================
*/

import * as XLSX from "xlsx";

class ExcelService {

    /* ==================================================
       JSON → WORKBOOK
    ================================================== */

    createWorkbook(data = [], sheetName = "Sheet1") {

        const workbook = XLSX.utils.book_new();

        const worksheet = XLSX.utils.json_to_sheet(data);

        XLSX.utils.book_append_sheet(

            workbook,

            worksheet,

            sheetName

        );

        return workbook;

    }

    /* ==================================================
       DOWNLOAD
    ================================================== */

    download(

        data = [],

        filename = "export.xlsx",

        sheetName = "Sheet1"

    ) {

        const workbook = this.createWorkbook(

            data,

            sheetName

        );

        XLSX.writeFile(

            workbook,

            filename

        );

    }

    /* ==================================================
       MULTIPLE SHEETS
    ================================================== */

    downloadMultiple(

        sheets = {},

        filename = "export.xlsx"

    ) {

        const workbook = XLSX.utils.book_new();

        Object.entries(sheets)

            .forEach(([name, data]) => {

                const sheet =

                    XLSX.utils.json_to_sheet(data);

                XLSX.utils.book_append_sheet(

                    workbook,

                    sheet,

                    name

                );

            });

        XLSX.writeFile(

            workbook,

            filename

        );

    }

}

const excelService =

    new ExcelService();

export default excelService;

export {

    ExcelService

};
