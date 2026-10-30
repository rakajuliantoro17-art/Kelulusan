/*
==================================================

SARPRASIN v2.0

SEARCH INDEX SERVICE

Local Search Index Engine

Version : 2.0.0

==================================================
*/


import {

normalizeText

}

from "./search.mapper.js";







/*
==================================================
INDEX STORAGE

Temporary memory index

==================================================
*/


const indexStore = {};









/*
==================================================
CREATE INDEX

Membuat index dari data

Example:

assets[]

==================================================
*/


export function createIndex(

collection,

items,

fields=[]

){



const index = [];





items.forEach(

item=>{



const searchable =

fields

.map(

field=>

normalizeText(

item[field]

)

)

.join(" ");






index.push({



id:item.id,



searchable,



data:item



});



}

);





indexStore[collection]=index;





return index;


}









/*
==================================================
GET INDEX

==================================================
*/


export function getIndex(

collection

){


return indexStore[collection] || [];

}









/*
==================================================
REMOVE INDEX

==================================================
*/


export function removeIndex(

collection

){



delete indexStore[collection];


}









/*
==================================================
CLEAR ALL INDEX

==================================================
*/


export function clearIndex(){



Object.keys(indexStore)

.forEach(

key=>

delete indexStore[key]

);


}









/*
==================================================
SEARCH INDEX

Basic full text search

==================================================
*/


export function searchIndex(

collection,

keyword

){



const index =

getIndex(collection);





if(!keyword)

return [];





const query=

normalizeText(keyword);





return index.filter(

item=>


item.searchable

.includes(query)



)

.map(

item=>

item.data

);



}









/*
==================================================
MULTI KEYWORD SEARCH

Example:

"Laptop Lab"

==================================================
*/


export function multiSearch(

collection,

keyword

){



const words=

normalizeText(keyword)

.split(" ")

.filter(Boolean);





const index=

getIndex(collection);





return index.filter(

item=>{


return words.every(

word=>

item.searchable

.includes(word)

);


}

)

.map(

item=>

item.data

);



}









/*
==================================================
REBUILD INDEX

Dipanggil saat data berubah

==================================================
*/


export function rebuildIndex(

collection,

items,

fields

){


removeIndex(collection);


return createIndex(

collection,

items,

fields

);


}
