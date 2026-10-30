/*
==================================================

STORE STORAGE

==================================================
*/


export function saveState(

key,

data

){



localStorage.setItem(

`sarprasin_${key}`,

JSON.stringify(data)

);



}




export function loadState(

key

){



const data=

localStorage.getItem(

`sarprasin_${key}`

);



return data

?

JSON.parse(data)

:

null;


}
