/*
==================================================

SARPRASIN v2.0

FILTER SERVICE

Central Filtering Engine

Version : 2.0.0

==================================================
*/


import {

FILTER_OPERATOR

}

from "./search.constants.js";







/*
==================================================
BASIC FILTER

Filter berdasarkan satu field

==================================================
*/


export function filterByField(

items,

field,

value

){


if(

!value && value !== false

)

return items;





return items.filter(

item =>

item[field] === value

);


}









/*
==================================================
SEARCH TEXT

Pencarian teks global

==================================================
*/


export function searchText(

items,

keyword,

fields=[]

){



if(!keyword)

return items;





const query =

keyword

.toLowerCase()

.trim();





return items.filter(

item=>{


return fields.some(

field=>{


const value =

item[field];



return value &&

String(value)

.toLowerCase()

.includes(query);



}

);



}

);



}









/*
==================================================
MULTI FILTER

Contoh:

{
status:"active",
room:"Lab"
}

==================================================
*/


export function applyFilters(

items,

filters={}

){



return items.filter(

item=>{


return Object.entries(

filters

)

.every(

([key,value])=>{


if(

value===null ||

value===undefined ||

value===""

)

return true;




return item[key]===value;



}

);



}

);



}









/*
==================================================
ADVANCED FILTER

Operator:

=

!=

>

<

contains

==================================================
*/


export function advancedFilter(

items,

rules=[]

){



return items.filter(

item=>{


return rules.every(

rule=>{


const value =

item[rule.field];




switch(

rule.operator

){



case FILTER_OPERATOR.EQUAL:



return value === rule.value;






case FILTER_OPERATOR.NOT_EQUAL:



return value !== rule.value;






case FILTER_OPERATOR.CONTAINS:



return String(value)

.toLowerCase()

.includes(

String(rule.value)

.toLowerCase()

);







case FILTER_OPERATOR.GREATER:



return value >

rule.value;






case FILTER_OPERATOR.LESS:



return value <

rule.value;






default:


return true;



}



}

);



}

);



}









/*
==================================================
SORT DATA

Sorting hasil filter

==================================================
*/


export function sortData(

items,

field,

direction="asc"

){



return [...items]

.sort(

(a,b)=>{


const first=

a[field];


const second=

b[field];




if(

first < second

)

return direction==="asc"

?

-1

:

1;




if(

first > second

)

return direction==="asc"

?

1

:

-1;




return 0;



}

);



}









/*
==================================================
PAGINATION

Untuk tabel besar

==================================================
*/


export function paginate(

items,

page=1,

limit=20

){



const start =

(page-1)

*

limit;



return{


data:

items.slice(

start,

start+limit

),



page,


limit,



total:

items.length,



totalPage:

Math.ceil(

items.length /

limit

)


};



}









/*
==================================================
FILTER PIPELINE

Gabungan semua proses

==================================================
*/


export function filterPipeline(

items,

config={}

){



let result=[...items];





if(config.keyword){


result =

searchText(

result,

config.keyword,

config.fields || []

);


}





if(config.filters){


result =

applyFilters(

result,

config.filters

);


}





if(config.sort){


result =

sortData(

result,

config.sort.field,

config.sort.direction

);


}





if(config.pagination){


result =

paginate(

result,

config.pagination.page,

config.pagination.limit

);


}





return result;


}
