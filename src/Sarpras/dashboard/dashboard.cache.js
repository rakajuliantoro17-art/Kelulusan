const cache = {};

export function getDashboardCache(key){

    return cache[key] ?? null;

}

export function setDashboardCache(key,value){

    cache[key]={

        value,

        timestamp:Date.now()

    };

}

export function clearDashboardCache(){

    Object.keys(cache)

    .forEach(key=>delete cache[key]);

}
