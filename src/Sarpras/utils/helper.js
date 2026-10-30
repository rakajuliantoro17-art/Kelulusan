/*
==================================================

SARPRASIN v2.0

HELPER UTILITY

General Application Helpers

Version : 2.0.0

==================================================
*/







/*
==================================================
CHECK EMPTY

==================================================
*/


export function isEmpty(

value

){



return (

value===null ||

value===undefined ||

value===""

);



}









/*
==================================================
DEFAULT VALUE

==================================================
*/


export function defaultValue(

value,

fallback

){



return isEmpty(value)

?

fallback

:

value;


}









/*
==================================================
SLEEP / DELAY

==================================================
*/


export function sleep(

ms

){



return new Promise(

resolve=>

setTimeout(

resolve,

ms

)

);


}









/*
==================================================
GENERATE ID

==================================================
*/


export function generateId(

prefix="ID"

){



return (

prefix

+

"-"

+

Date.now()

+

"-"

+

Math.random()

.toString(36)

.substring(2,8)

);


}









/*
==================================================
RANDOM STRING

==================================================
*/


export function randomString(

length=8

){



const chars=

"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";



let result="";





for(

let i=0;

i<length;

i++

){



result+=

chars.charAt(

Math.floor(

Math.random()*chars.length

)

);



}





return result;


}









/*
==================================================
DEEP CLONE

==================================================
*/


export function deepClone(

object

){



return JSON.parse(

JSON.stringify(object)

);


}









/*
==================================================
DEEP COMPARE

==================================================
*/


export function deepEqual(

a,

b

){



return (

JSON.stringify(a)

===

JSON.stringify(b)

);


}









/*
==================================================
MERGE OBJECT

==================================================
*/


export function mergeObject(

target,

source

){



return {

...target,

...source

};


}









/*
==================================================
DEBOUNCE

Untuk search input

==================================================
*/


export function debounce(

callback,

delay=300

){



let timer;



return function(...args){



clearTimeout(timer);





timer=setTimeout(

()=>{


callback.apply(

this,

args

);


},

delay

);



};



}









/*
==================================================
THROTTLE

==================================================
*/


export function throttle(

callback,

limit=300

){



let waiting=false;





return function(...args){



if(waiting)

return;





callback.apply(

this,

args

);



waiting=true;





setTimeout(

()=>{


waiting=false;


},

limit

);



};



}









/*
==================================================
SAFE EXECUTE

==================================================
*/


export async function safeExecute(

callback,

fallback=null

){



try{


return await callback();



}

catch(error){



console.error(

error

);



return fallback;


}



}









/*
==================================================
ARRAY CHUNK

Membagi data besar

==================================================
*/


export function chunkArray(

array,

size=100

){



const chunks=[];





for(

let i=0;

i<array.length;

i+=size

){



chunks.push(

array.slice(

i,

i+size

)

);



}





return chunks;


}









/*
==================================================
UNIQUE ARRAY

==================================================
*/


export function uniqueArray(

array

){



return [

...new Set(array)

];


}









/*
==================================================
REMOVE DUPLICATE OBJECT

==================================================
*/


export function uniqueBy(

array,

key

){



const map=new Map();





array.forEach(

item=>{


map.set(

item[key],

item

);


}

);





return [

...map.values()

];


}









/*
==================================================
WAIT UNTIL

==================================================
*/


export function waitUntil(

condition,

timeout=5000,

interval=100

){



return new Promise(

(resolve,reject)=>{


const start=

Date.now();





const timer=

setInterval(

()=>{



if(

condition()

){



clearInterval(timer);


resolve(true);


}






if(

Date.now()-start >

timeout

){



clearInterval(timer);


reject(

new Error(

"Timeout"

)

);


}



},

interval

);



}


);


}









/*
==================================================
COPY OBJECT WITHOUT FIELD

==================================================
*/


export function omit(

object,

keys=[]

){



const result={

...object

};





keys.forEach(

key=>

delete result[key]

);





return result;


}









/*
==================================================
PICK OBJECT FIELD

==================================================
*/


export function pick(

object,

keys=[]

){



return keys.reduce(

(result,key)=>{


if(key in object){


result[key]=object[key];


}


return result;



},

{}



);


}
