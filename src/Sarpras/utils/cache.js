/*
==================================================

SARPRASIN v2.0

CACHE UTILITY

Lightweight Cache Helper

Version : 2.0.0

==================================================
*/





/*
==================================================
MEMORY CACHE

==================================================
*/


const memoryCache = {};









/*
==================================================
SET CACHE

==================================================
*/


export function setCache(

key,

value,

ttl = 300000

){



memoryCache[key]={


value,


expires:

Date.now()+ttl


};



return value;


}









/*
==================================================
GET CACHE

==================================================
*/


export function getCache(

key

){



const item=

memoryCache[key];





if(!item)

return null;





if(

Date.now()

>

item.expires

){



delete memoryCache[key];



return null;


}





return item.value;


}









/*
==================================================
HAS CACHE

==================================================
*/


export function hasCache(

key

){


return Boolean(

getCache(key)

);


}









/*
==================================================
REMOVE CACHE

==================================================
*/


export function removeCache(

key

){



delete memoryCache[key];


}









/*
==================================================
CLEAR CACHE

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
LOCAL STORAGE CACHE

==================================================
*/


export function setLocalCache(

key,

value

){



localStorage.setItem(

`sarprasin_cache_${key}`,

JSON.stringify({

value,

time:

Date.now()

})

);


}









/*
==================================================
GET LOCAL CACHE

==================================================
*/


export function getLocalCache(

key,

maxAge=3600000

){



const data=

localStorage.getItem(

`sarprasin_cache_${key}`

);





if(!data)

return null;





const parsed=

JSON.parse(data);





if(

Date.now()

-

parsed.time

>

maxAge

){



removeLocalCache(key);



return null;


}





return parsed.value;


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

`sarprasin_cache_${key}`

);


}









/*
==================================================
SESSION CACHE

==================================================
*/


export function setSessionCache(

key,

value

){



sessionStorage.setItem(

`sarprasin_${key}`,

JSON.stringify(value)

);


}









export function getSessionCache(

key

){



const data=

sessionStorage.getItem(

`sarprasin_${key}`

);





return data

?

JSON.parse(data)

:

null;


}









/*
==================================================
CACHE REMEMBER

Auto fetch pattern

==================================================

Example:

cacheRemember(
"asset",
()=>getAsset()
)

==================================================
*/


export async function cacheRemember(

key,

callback,

ttl

){



const cached=

getCache(key);





if(cached)

return cached;





const data=

await callback();





setCache(

key,

data,

ttl

);





return data;


}









/*
==================================================
CACHE SIZE

==================================================
*/


export function cacheSize(){



return Object.keys(

memoryCache

).length;


}
