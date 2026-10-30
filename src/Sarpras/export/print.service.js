/*
==========================================================
Sarprasin 2.0
Print Service
File : src/services/export/print.service.js
Version : 2.0.0
==========================================================
*/

class PrintService {

    /* ==========================================
       PRINT CURRENT PAGE
    ========================================== */

    print() {

        window.print();

    }

    /* ==========================================
       PRINT HTML
    ========================================== */

    printHtml(

        html,

        title = "Print"

    ) {

        const win = window.open(

            "",

            "_blank",

            "width=1024,height=768"

        );

        if (!win) {

            throw new Error(

                "Popup diblokir browser."

            );

        }

        win.document.write(`

            <!DOCTYPE html>

            <html>

            <head>

                <title>${title}</title>

                <style>

                    body{

                        font-family:Arial,sans-serif;

                        padding:20px;

                    }

                    table{

                        width:100%;

                        border-collapse:collapse;

                    }

                    th,td{

                        border:1px solid #ccc;

                        padding:8px;

                    }

                    th{

                        background:#eee;

                    }

                </style>

            </head>

            <body>

                ${html}

            </body>

            </html>

        `);

        win.document.close();

        win.focus();

        win.print();

        win.close();

    }

    /* ==========================================
       PRINT ELEMENT
    ========================================== */

    printElement(

        selector,

        title = "Print"

    ) {

        const element =

            document.querySelector(selector);

        if (!element) {

            throw new Error(

                "Element tidak ditemukan."

            );

        }

        this.printHtml(

            element.innerHTML,

            title

        );

    }

}

const printService =

    new PrintService();

export default printService;

export {

    PrintService

};
