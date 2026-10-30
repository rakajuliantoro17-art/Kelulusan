const cache={};

export function setQR(key,value){

    cache[key]=value;

}

export function getQR(key){

    return cache[key] ?? null;

}

export function clearQR(){

    Object.keys(cache)

    .forEach(

        key=>delete cache[key]

    );

}
