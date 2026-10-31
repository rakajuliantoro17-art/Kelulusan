/*
==================================================

CONFIG INITIALIZER

==================================================
*/


import {

getVersion

}

from "../services/system/version.service.js";


import {

getEnvironment

}

from "../services/system/environment.service.js";





export async function initConfig(){



const version=

getVersion();



const env=

getEnvironment();





console.log(

"SARPRASIN",

version.version,

env

);



}
