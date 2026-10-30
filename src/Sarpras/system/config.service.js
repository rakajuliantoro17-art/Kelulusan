/*
==================================================

SARPRASIN v2.0

CONFIG SERVICE

Central Application Configuration Manager

Version : 2.0.0

==================================================
*/


import {

CONFIG_KEY

}

from "./system.constants.js";





/*
==================================================
DEFAULT CONFIGURATION

Fallback jika konfigurasi eksternal tidak tersedia

==================================================
*/


const defaultConfig = {


app:{


name:"SARPRASIN",


version:"2.0.0",


environment:"production",


debug:false


},




school:{


name:"SMAN 1 Sooko",


location:"Mojokerto",


province:"Jawa Timur"


},





feature:{


qrScanner:true,


spreadsheetSync:true,


maintenance:true,


reportExport:true,


notification:true


},





upload:{


maxSize:5,


allowed:[

"jpg",

"jpeg",

"png",

"pdf"

]


},





cache:{


enabled:true,


duration:300000


},





system:{


timezone:"Asia/Jakarta",


language:"id"


}


};








/*
==================================================
RUNTIME CONFIG STORAGE

==================================================
*/


let runtimeConfig={

...defaultConfig

};









/*
==================================================
GET ALL CONFIG

==================================================
*/


export function getConfig(){


return runtimeConfig;


}









/*
==================================================
GET CONFIG BY PATH

Example:

getConfigValue(
"school.name"
)

==================================================
*/


export function getConfigValue(

path

){



return path

.split(".")

.reduce(

(obj,key)=>

obj?.[key],

runtimeConfig

);


}









/*
==================================================
SET CONFIG

Runtime only

==================================================
*/


export function setConfig(

path,

value

){



const keys=

path.split(".");



let target=

runtimeConfig;





keys.forEach(

(key,index)=>{



if(index===keys.length-1){



target[key]=value;


}

else{


if(!target[key])

target[key]={};


target=

target[key];


}



}

);



}









/*
==================================================
LOAD EXTERNAL CONFIG

Firebase / API / JSON

==================================================
*/


export async function loadConfig(

source

){



try{



const response=

await fetch(source);



const data=

await response.json();





runtimeConfig={


...runtimeConfig,


...data


};





return runtimeConfig;



}

catch(error){



console.error(

"Config loading failed",

error

);



return runtimeConfig;


}



}









/*
==================================================
FEATURE CHECK

==================================================
*/


export function isFeatureEnabled(

feature

){



return Boolean(

runtimeConfig

.feature

[feature]

);


}









/*
==================================================
RESET CONFIG

==================================================
*/


export function resetConfig(){



runtimeConfig={

...defaultConfig

};


}









/*
==================================================
EXPORT CONFIG

Untuk debugging

==================================================
*/


export function exportConfig(){



return JSON.stringify(

runtimeConfig,

null,

2

);


}
