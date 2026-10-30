import {

request

}

from "./spreadsheet.api.js";

export async function getSheet(sheet){

    return request(

        "get",

        {sheet}

    );

}

export async function appendSheet(

sheet,

data

){

    return request(

        "append",

        {

            sheet,

            data

        }

    );

}

export async function updateSheet(

sheet,

data

){

    return request(

        "update",

        {

            sheet,

            data

        }

    );

}
