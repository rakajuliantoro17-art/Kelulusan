const cache = {};

export function getReportCache(key){

    return cache[key] ?? null;

}

export function setReportCache(key,value){

    cache[key]={

        value,

        timestamp:Date.now()

    };

}

export function clearReportCache(){

    Object.keys(cache)

    .forEach(

        key=>delete cache[key]

    );

}
