/*
==========================================================
Sarprasin 2.0
CSV Export Service
File : src/services/export/csv.service.js
Version : 2.0.0
==========================================================
*/

const DEFAULT_SEPARATOR = ",";

class CsvService {

    constructor(separator = DEFAULT_SEPARATOR) {

        this.separator = separator;

    }

    /* ==================================================
       ESCAPE VALUE
    ================================================== */

    escape(value) {

        if (value === null || value === undefined) {

            return "";

        }

        const text = String(value);

        return `"${text.replace(/"/g, '""')}"`;

    }

    /* ==================================================
       ARRAY → CSV
    ================================================== */

    generate(data = []) {

        if (!Array.isArray(data) || data.length === 0) {

            return "";

        }

        const headers = Object.keys(data[0]);

        const rows = data.map(row =>

            headers.map(key =>

                this.escape(row[key])

            ).join(this.separator)

        );

        return [

            headers.join(this.separator),

            ...rows

        ].join("\n");

    }

    /* ==================================================
       DOWNLOAD
    ================================================== */

    download(data = [], filename = "export.csv") {

        const csv = this.generate(data);

        const blob = new Blob(

            [csv],

            {

                type: "text/csv;charset=utf-8;"

            }

        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = filename;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

    }

}

const csvService = new CsvService();

export default csvService;

export {

    CsvService

};
