/*
==========================================================
Sarprasin 2.0
CSV Import Service
File : src/services/import/csv.service.js
Version : 2.0.0
==========================================================
*/

class CsvImportService {

    /* ==========================================
       READ FILE
    ========================================== */

    async read(file) {

        return new Promise((resolve, reject) => {

            const reader = new FileReader();

            reader.onload = event => {

                try {

                    resolve(

                        this.parse(

                            event.target.result

                        )

                    );

                }

                catch (error) {

                    reject(error);

                }

            };

            reader.onerror = reject;

            reader.readAsText(

                file,

                "utf-8"

            );

        });

    }

    /* ==========================================
       PARSE CSV
    ========================================== */

    parse(content = "") {

        const rows = content

            .trim()

            .split(/\r?\n/);

        if (!rows.length) {

            return [];

        }

        const headers = rows.shift()

            .split(",")

            .map(item => item.trim());

        return rows.map(row => {

            const values = row

                .split(",")

                .map(value =>

                    value.replace(/^"|"$/g, "").trim()

                );

            const result = {};

            headers.forEach((header, index) => {

                result[header] =

                    values[index] ?? "";

            });

            return result;

        });

    }

    /* ==========================================
       PREVIEW
    ========================================== */

    preview(data = [], limit = 10) {

        return data.slice(0, limit);

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

    /* ==========================================
       ROW COUNT
    ========================================== */

    count(data = []) {

        return data.length;

    }

}

const csvImportService =

    new CsvImportService();

export default csvImportService;

export {

    CsvImportService

};
