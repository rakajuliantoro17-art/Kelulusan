import {

spreadsheetService

}

from "../../spreadsheet/spreadsheet.service.js";

import {

cacheStore

}

from "../../../store";

export const schedulerJobs=[

{

name:"Spreadsheet Sync",

cron:"0 */6 * * *",

async run(){

    await spreadsheetService.sync("Asset");

}

},

{

name:"Clear Cache",

cron:"0 0 * * *",

async run(){

    cacheStore.clear();

}

},

{

name:"Daily Dashboard Refresh",

cron:"0 6 * * *",

async run(){

    console.log(

        "Dashboard refreshed."

    );

}

}

];
