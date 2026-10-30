/*
==================================================

SARPRASIN v2.0

FORMATTER UTILITY

Central Data Formatting Helper

Version : 2.0.0

==================================================
*/







/*
==================================================
DATE FORMAT

2026-07-19

menjadi

19 Juli 2026

==================================================
*/


export function formatDate(

date

){


if(!date)

return "-";



return new Intl.DateTimeFormat(

"id-ID",

{

day:"2-digit",

month:"long",

year:"numeric"

}

)

.format(

new Date(date)

);


}









/*
==================================================
SHORT DATE

19/07/2026

==================================================
*/


export function formatShortDate(

date

){



if(!date)

return "-";



return new Intl.DateTimeFormat(

"id-ID",

{

day:"2-digit",

month:"2-digit",

year:"numeric"

}

)

.format(

new Date(date)

);


}









/*
==================================================
TIME FORMAT

==================================================
*/


export function formatTime(

date

){



if(!date)

return "-";



return new Intl.DateTimeFormat(

"id-ID",

{

hour:"2-digit",

minute:"2-digit"

}

)

.format(

new Date(date)

);


}









/*
==================================================
DATETIME

==================================================
*/


export function formatDateTime(

date

){



return (

formatDate(date)

+

" "

+

formatTime(date)

);


}









/*
==================================================
NUMBER FORMAT

==================================================
*/


export function formatNumber(

number

){



if(

number===null ||

number===undefined

)

return "0";





return new Intl.NumberFormat(

"id-ID"

)

.format(

number

);


}









/*
==================================================
CURRENCY FORMAT

Rupiah

==================================================
*/


export function formatCurrency(

value

){



if(

!value

)

return "Rp 0";





return new Intl.NumberFormat(

"id-ID",

{

style:"currency",

currency:"IDR",

maximumFractionDigits:0

}

)

.format(

value

);


}









/*
==================================================
PERCENTAGE

==================================================
*/


export function formatPercent(

value

){



return (

Number(value)

.toFixed(1)

+

"%"

);


}









/*
==================================================
FILE SIZE

Byte → MB

==================================================
*/


export function formatFileSize(

bytes

){



if(

bytes===0

)

return "0 Byte";





const sizes=[

"Byte",

"KB",

"MB",

"GB"

];





const index=

Math.floor(

Math.log(bytes)

/Math.log(1024)

);





return (

Math.round(

bytes /

Math.pow(

1024,

index

)

,

2

)

+

" "

+

sizes[index]

);


}









/*
==================================================
TEXT FORMAT

==================================================
*/


export function capitalize(

text

){



if(!text)

return "";





return text

.charAt(0)

.toUpperCase()

+

text.slice(1);

}


export function titleCase(

text

){



if(!text)

return "";





return text

.toLowerCase()

.split(" ")

.map(

word=>

capitalize(word)

)

.join(" ");


}









/*
==================================================
TRUNCATE TEXT

==================================================
*/


export function truncate(

text,

length=50

){



if(

!text

)

return "";





return text.length >

length

?

text.substring(

0,

length

)

+

"..."

:

text;


}









/*
==================================================
ASSET CODE FORMAT

AST-00001

==================================================
*/


export function formatAssetCode(

number

){



return (

"AST-"

+

String(number)

.padStart(

5,

"0"

)

);


}









/*
==================================================
STATUS FORMAT

==================================================
*/


export function formatStatus(

status

){



const map={


active:"Aktif",


inactive:"Tidak Aktif",


repair:"Perbaikan",


broken:"Rusak",


lost:"Hilang",


available:"Tersedia"



};





return (

map[status]

||

status

||

"-"

);


}









/*
==================================================
CONDITION FORMAT

Kondisi Aset

==================================================
*/


export function formatCondition(

condition

){



const map={


good:"Baik",


minor:"Rusak Ringan",


major:"Rusak Berat",


destroyed:"Tidak Layak"



};





return (

map[condition]

||

"-"

);


}









/*
==================================================
PHONE FORMAT

==================================================
*/


export function formatPhone(

phone

){



if(!phone)

return "-";





return phone

.replace(

/(\d{4})(\d{4})(\d+)/,

"$1-$2-$3"

);


}









/*
==================================================
BOOLEAN FORMAT

==================================================
*/


export function formatBoolean(

value

){



return value

?

"Ya"

:

"Tidak";


}









/*
==================================================
EMPTY HANDLER

==================================================
*/


export function formatEmpty(

value,

fallback="-"

){



return (

value

||

fallback

);


}
