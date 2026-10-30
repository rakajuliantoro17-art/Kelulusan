const cache = {};

export function setSpreadsheetCache(key,value){

    cache[key]={

        value,

        timestamp:Date.now()

    };

}

export function getSpreadsheetCache(key){

    return cache[key] ?? null;

}

export function clearSpreadsheetCache(){

    Object.keys(cache)

    .forEach(

        key=>delete cache[key]

    );

}
