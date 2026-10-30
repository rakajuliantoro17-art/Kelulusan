import {

SHEET_NAME

}

from "./spreadsheet.constants.js";

import {

getSheet,

appendSheet,

updateSheet

}

from "./spreadsheet.repository.js";

import {

enqueue

}

from "./spreadsheet.queue.js";

export const spreadsheetService={

    async asset(){

        return await getSheet(

            SHEET_NAME.ASSET

        );

    },

    async room(){

        return await getSheet(

            SHEET_NAME.ROOM

        );

    },

    async maintenance(){

        return await getSheet(

            SHEET_NAME.MAINTENANCE

        );

    },

    async append(sheet,data){

        return enqueue(

            ()=>appendSheet(

                sheet,

                data

            )

        );

    },

    async update(sheet,data){

        return enqueue(

            ()=>updateSheet(

                sheet,

                data

            )

        );

    },

    async sync(sheet){

        return await getSheet(sheet);

    }

};
