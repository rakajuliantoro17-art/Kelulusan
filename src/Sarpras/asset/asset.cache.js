/*
==================================================
ASSET CACHE

==================================================
*/


const cache={};





export function setCache(
key,
data
){


cache[key]={


data,


time:
Date.now()


};


}





export function getCache(
key
){



return cache[key] || null;



}





export function clearCache(){


Object.keys(cache)

.forEach(

key=>delete cache[key]

);


}
