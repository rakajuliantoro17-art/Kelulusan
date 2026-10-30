/*
==================================================

SARPRASIN v2.0

VALIDATOR UTILITY

Reusable Data Validation Helper

Version : 2.0.0

==================================================
*/







/*
==================================================
REQUIRED CHECK

==================================================
*/


export function required(

value

){


return (

value!==null &&

value!==undefined &&

value!==""

);


}









/*
==================================================
STRING VALIDATOR

==================================================
*/


export function isString(

value

){


return typeof value==="string";


}









/*
==================================================
NUMBER VALIDATOR

==================================================
*/


export function isNumber(

value

){



return (

typeof value==="number"

&&

!isNaN(value)

);


}









/*
==================================================
INTEGER VALIDATOR

==================================================
*/


export function isInteger(

value

){



return Number.isInteger(

Number(value)

);


}









/*
==================================================
MIN LENGTH

==================================================
*/


export function minLength(

value,

length

){



return (

String(value)

.length >= length

);


}









/*
==================================================
MAX LENGTH

==================================================
*/


export function maxLength(

value,

length

){



return (

String(value)

.length <= length

);


}









/*
==================================================
EMAIL VALIDATOR

==================================================
*/


export function isEmail(

email

){



return /^[^\s@]+@[^\s@]+\.[^\s@]+$/

.test(

email

);


}









/*
==================================================
PHONE VALIDATOR

Indonesia

==================================================
*/


export function isPhone(

phone

){



return /^08[0-9]{8,11}$/

.test(

phone

);


}









/*
==================================================
URL VALIDATOR

==================================================
*/


export function isURL(

url

){



try{


new URL(url);


return true;


}

catch{


return false;


}



}









/*
==================================================
DATE VALIDATOR

==================================================
*/


export function isDate(

date

){



return (

!isNaN(

Date.parse(date)

)

);


}









/*
==================================================
FILE VALIDATOR

==================================================
*/


export function validateFile(

file,

options={}

){



if(!file)

return false;





if(options.maxSize){



if(

file.size >

options.maxSize

)

return false;



}





if(options.types){



if(

!options.types.includes(

file.type

)

)

return false;



}





return true;


}









/*
==================================================
IMAGE VALIDATOR

==================================================
*/


export function validateImage(

file

){



return validateFile(

file,

{


maxSize:

5*1024*1024,


types:[

"image/jpeg",

"image/png",

"image/webp"

]


}

);



}









/*
==================================================
ASSET CODE VALIDATOR

AST-00001

==================================================
*/


export function validateAssetCode(

code

){



return /^AST-\d{5}$/

.test(

code

);


}









/*
==================================================
QR CODE VALIDATOR

==================================================
*/


export function validateQRCode(

code

){



return (

typeof code==="string"

&&

code.length>5

);


}









/*
==================================================
PASSWORD VALIDATOR

==================================================
*/


export function validatePassword(

password

){



return (

password.length>=8

&&

/[A-Z]/

.test(password)

&&

/[0-9]/

.test(password)

);


}









/*
==================================================
OBJECT VALIDATOR

==================================================
*/


export function validateObject(

object,

fields=[]

){



return fields.every(

field=>

required(

object[field]

)

);


}









/*
==================================================
ARRAY VALIDATOR

==================================================
*/


export function validateArray(

array

){



return (

Array.isArray(array)

&&

array.length>0

);


}









/*
==================================================
SCHEMA VALIDATOR

Generic validation

==================================================

Example:

validateSchema(
data,
{
name:"required",
email:"email"
}

)

==================================================
*/


export function validateSchema(

data,

schema

){



const errors={};





Object.entries(schema)

.forEach(

([field,rule])=>{



switch(rule){



case "required":



if(!required(data[field]))

errors[field]="Field wajib diisi";


break;






case "email":



if(

!isEmail(data[field])

)

errors[field]="Email tidak valid";


break;






case "number":



if(

!isNumber(data[field])

)

errors[field]="Harus angka";


break;



}





}

);





return{


valid:

Object.keys(errors).length===0,


errors



};


}
