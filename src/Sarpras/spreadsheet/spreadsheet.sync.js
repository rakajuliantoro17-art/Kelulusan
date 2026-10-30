import {

getSheet

}

from "./spreadsheet.repository.js";

export async function syncSheet(sheet){

    return await getSheet(sheet);

}
