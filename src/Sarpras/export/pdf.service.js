/*
==========================================================
Sarprasin 2.0
PDF Export Service
File : src/services/export/pdf.service.js
Version : 2.0.0
==========================================================
*/

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

class PdfService {

    /* ==========================================
       CREATE DOCUMENT
    ========================================== */

    create(title = "Sarprasin Report") {

        const doc = new jsPDF({

            orientation: "portrait",

            unit: "mm",

            format: "a4"

        });

        doc.setFont("helvetica", "bold");

        doc.setFontSize(16);

        doc.text(title, 15, 20);

        doc.setFont("helvetica", "normal");

        doc.setFontSize(10);

        doc.text(

            `Generated : ${new Date().toLocaleString("id-ID")}`,

            15,

            28

        );

        return doc;

    }

    /* ==========================================
       TABLE
    ========================================== */

    table(

        doc,

        data = [],

        columns = []

    ) {

        autoTable(doc, {

            head: [columns],

            body: data,

            startY: 35,

            styles: {

                fontSize: 9

            },

            headStyles: {

                fontStyle: "bold"

            }

        });

    }

    /* ==========================================
       SAVE
    ========================================== */

    save(

        doc,

        filename = "report.pdf"

    ) {

        doc.save(filename);

    }

    /* ==========================================
       EXPORT
    ========================================== */

    export({

        title = "Sarprasin Report",

        columns = [],

        rows = [],

        filename = "report.pdf"

    }) {

        const doc = this.create(title);

        this.table(

            doc,

            rows,

            columns

        );

        this.save(

            doc,

            filename

        );

    }

}

const pdfService =

    new PdfService();

export default pdfService;

export {

    PdfService

};
