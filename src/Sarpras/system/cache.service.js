/*
==================================================

SARPRASIN v2.0

CACHE SERVICE

Central Application Cache Manager

Version : 2.0.0

==================================================
*/


import {

CACHE_TYPE,

CACHE_DURATION

}

from "./system.constants.js";







/*
==================================================
CACHE STORAGE

Memory Cache

==================================================
*/


const memoryCache = {};









/*
==================================================
CREATE CACHE

==================================================
*/


export function setCache(

key,

value,

duration = CACHE_DURATION.DEFAULT

){



memoryCache[key]={



value,



createdAt:

Date.now(),



expiredAt:

Date.now()+duration



};





return true;


}









/*
==================================================
GET CACHE

==================================================
*/


export function getCache(

key

){



const cache=

memoryCache[key];





if(!cache)

return null;





if(

Date.now()

>

cache.expiredAt

){



delete memoryCache[key];



return null;


}






return cache.value;


}









/*
==================================================
CHECK CACHE EXIST

==================================================
*/


export function hasCache(

key

){



return getCache(key)!==null;


}









/*
==================================================
DELETE CACHE

==================================================
*/


export function removeCache(

key

){



delete memoryCache[key];


}









/*
==================================================
CLEAR ALL CACHE

==================================================
*/


export function clearCache(){



Object.keys(memoryCache)

.forEach(

key=>{


delete memoryCache[key];


}

);


}









/*
==================================================
CACHE WITH FUNCTION

Auto cache pattern

==================================================

Example:

await cacheRemember(
"assets",
()=>getAssets()
)

==================================================
*/


export async function cacheRemember(

key,

callback,

duration

){



const cached=

getCache(key);





if(cached){



return cached;


}





const data=

await callback();





setCache(

key,

data,

duration

);





return data;


}









/*
==================================================
LOCAL STORAGE CACHE

Untuk persistence

==================================================
*/


export function saveLocalCache(

key,

data

){



localStorage.setItem(

`sarprasin_${key}`,

JSON.stringify({

data,

time:Date.now()

})

);


}









export function loadLocalCache(

key

){



const item=

localStorage.getItem(

`sarprasin_${key}`

);





if(!item)

return null;





return JSON.parse(item);


}









/*
==================================================
REMOVE LOCAL CACHE

==================================================
*/


export function removeLocalCache(

key

){



localStorage.removeItem(

`sarprasin_${key}`

);


}









/*
==================================================
CACHE STATISTICS

Monitoring

==================================================
*/


export function cacheStats(){



return{


total:

Object.keys(

memoryCache

).length,



keys:

Object.keys(

memoryCache

)


};



}
