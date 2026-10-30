/*
==================================================

SARPRASIN v2.0

VERSION SERVICE

Application Version Manager

Version : 2.0.0

==================================================
*/


import {

VERSION_STATUS

}

from "./system.constants.js";







/*
==================================================
CURRENT APPLICATION VERSION

==================================================
*/


const appVersion = {


name:"SARPRASIN",


version:"2.0.0",


build:"20260719",


releaseDate:"2026-07-19",


codename:"Smart Inventory Evolution",


environment:

import.meta.env.VITE_APP_ENV || "development"


};









/*
==================================================
REMOTE VERSION

Akan diambil dari server/config

==================================================
*/


let remoteVersion=null;









/*
==================================================
GET CURRENT VERSION

==================================================
*/


export function getVersion(){


return {


...appVersion

};


}









/*
==================================================
GET VERSION STRING

==================================================
*/


export function getVersionString(){


return (

appVersion.name

+

" v"

+

appVersion.version

);


}









/*
==================================================
COMPARE VERSION

==================================================
*/


export function compareVersion(

current,

latest

){



const currentParts=

current.split(".").map(Number);


const latestParts=

latest.split(".").map(Number);





for(

let i=0;

i<3;

i++

){



if(

latestParts[i] >

currentParts[i]

)

return 1;



if(

latestParts[i] <

currentParts[i]

)

return -1;



}





return 0;


}









/*
==================================================
CHECK UPDATE

==================================================
*/


export function checkUpdate(){



if(!remoteVersion)

return {


status:

VERSION_STATUS.UNKNOWN

};





const result=

compareVersion(

appVersion.version,

remoteVersion.version

);





return{


status:

result < 0

?

VERSION_STATUS.UPDATE_AVAILABLE

:

VERSION_STATUS.LATEST,



current:

appVersion.version,



latest:

remoteVersion.version


};


}









/*
==================================================
LOAD REMOTE VERSION

==================================================
*/


export async function loadRemoteVersion(

url

){



try{


const response=

await fetch(

url,

{

cache:"no-store"

}

);



remoteVersion=

await response.json();





return remoteVersion;


}

catch(error){



console.error(

"Version check failed",

error

);



return null;


}


}









/*
==================================================
CHECK MINIMUM VERSION

==================================================
*/


export function checkMinimumVersion(

minimum

){



const result=

compareVersion(

appVersion.version,

minimum

);





return result>=0;


}









/*
==================================================
VERSION TAG

==================================================
*/


export function getVersionTag(){



return `

${appVersion.name}

-${appVersion.version}

-${appVersion.build}

`;

}
