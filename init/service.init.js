/*
==================================================

SERVICE INITIALIZER

==================================================
*/


import {

healthCheck

}

from "../services/system/health.service.js";





export async function initServices(){



await healthCheck();



console.log(

"Services initialized"

);



}
