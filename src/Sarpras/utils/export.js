/*
==================================================

SARPRASIN v2.0

EXPORT UTILITY

File Export Helper

Version : 2.0.0

==================================================
*/







/*
==================================================
CREATE FILE NAME

==================================================
*/


export function createFileName(

name,

extension

){


const date =

new Date()

.toISOString()

.split("T")[0];




return `${name}_${date}.${extension}`;


}









/*
==================================================
DOWNLOAD BLOB

Core download handler

==================================================
*/


export function downloadBlob(

blob,

filename

){



const url=

URL.createObjectURL(

blob

);





const link=

document.createElement(

"a"

);



link.href=url;


link.download=filename;



document.body.appendChild(

link

);



link.click();





document.body.removeChild(

link

);



URL.revokeObjectURL(

url

);


}









/*
==================================================
EXPORT JSON

==================================================
*/


export function exportJSON(

data,

filename="export.json"

){



const blob=

new Blob(

[

JSON.stringify(

data,

null,

2

)

],

{

type:

"application/json"

}

);





downloadBlob(

blob,

filename

);


}









/*
==================================================
EXPORT CSV

==================================================
*/


export function exportCSV(

data,

filename="export.csv"

){



if(

!Array.isArray(data)

||

data.length===0

)

return;





const headers=

Object.keys(

data[0]

);





const rows=

data.map(

item=>

headers.map(

header=>{


let value=

item[header];



if(

typeof value==="string"

&&

value.includes(",")

){


value=

`"${value}"`;

}


return value;


}

)

.join(",")

);





const csv=

[

headers.join(","),

...rows

]

.join("\n");





const blob=

new Blob(

[csv],

{

type:

"text/csv;charset=utf-8"

}

);





downloadBlob(

blob,

filename

);


}









/*
==================================================
EXPORT TABLE HTML

==================================================
*/


export function exportHTMLTable(

tableId,

filename

){



const table=

document.getElementById(

tableId

);





if(!table)

throw new Error(

"Table tidak ditemukan"

);





const blob=

new Blob(

[

table.outerHTML

],

{

type:

"text/html"

}

);





downloadBlob(

blob,

filename

);


}









/*
==================================================
EXPORT EXCEL COMPATIBLE

CSV dengan ekstensi XLS

==================================================
*/


export function exportExcel(

data,

filename

){



exportCSV(

data,

filename ||

createFileName(

"sarprasin",

"xls"

)

);


}









/*
==================================================
PRINT EXPORT

Untuk PDF melalui browser

==================================================
*/


export function printDocument(){

window.print();

}









/*
==================================================
COPY DATA TO CLIPBOARD

==================================================
*/


export async function copyExportData(

data

){



await navigator.clipboard.writeText(

JSON.stringify(

data,

null,

2

)

);



return true;


}









/*
==================================================
EXPORT SUMMARY

Membuat metadata export

==================================================
*/


export function exportMetadata(

data

){



return{


total:

data.length,


generated:

new Date(),


application:

"SARPRASIN v2.0"



};


}
