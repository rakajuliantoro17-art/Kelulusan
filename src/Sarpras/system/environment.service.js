/*
==================================================

SARPRASIN v2.0

ENVIRONMENT SERVICE

Application Environment Manager

Version : 2.0.0

==================================================
*/


import {

ENVIRONMENT

}

from "./system.constants.js";





/*
==================================================
CURRENT ENVIRONMENT

Diambil dari Vite Environment

==================================================
*/


const currentEnvironment =

import.meta.env.VITE_APP_ENV

||

ENVIRONMENT.DEVELOPMENT;









/*
==================================================
ENVIRONMENT CONFIG

==================================================
*/


const environmentConfig={


development:{


debug:true,


logLevel:"debug",


apiMode:"mock",


cache:false,


firebase:false


},




staging:{


debug:true,


logLevel:"info",


apiMode:"firebase",


cache:true,


firebase:true


},




production:{


debug:false,


logLevel:"error",


apiMode:"firebase",


cache:true,


firebase:true


}



};









/*
==================================================
GET CURRENT ENVIRONMENT

==================================================
*/


export function getEnvironment(){


return currentEnvironment;


}









/*
==================================================
GET ENVIRONMENT CONFIG

==================================================
*/


export function getEnvironmentConfig(){



return (

environmentConfig

[currentEnvironment]

);



}









/*
==================================================
CHECK ENVIRONMENT

==================================================
*/


export function isEnvironment(

env

){


return currentEnvironment===env;


}









/*
==================================================
DEVELOPMENT MODE

==================================================
*/


export function isDevelopment(){


return isEnvironment(

ENVIRONMENT.DEVELOPMENT

);


}









/*
==================================================
STAGING MODE

==================================================
*/


export function isStaging(){


return isEnvironment(

ENVIRONMENT.STAGING

);


}









/*
==================================================
PRODUCTION MODE

==================================================
*/


export function isProduction(){


return isEnvironment(

ENVIRONMENT.PRODUCTION

);


}









/*
==================================================
FEATURE BEHAVIOR

Mengatur perilaku aplikasi

==================================================
*/


export function getEnvironmentFlag(

flag

){



const config=

getEnvironmentConfig();





return Boolean(

config[flag]

);



}









/*
==================================================
API MODE

==================================================
*/


export function getApiMode(){



return getEnvironmentConfig()

.apiMode;


}









/*
==================================================
DEBUG STATUS

==================================================
*/


export function isDebug(){



return getEnvironmentConfig()

.debug;


}
