/*
==================================================

SARPRASIN v2.0.1

APPLICATION BOOTSTRAP

==================================================
*/


import {

initApplication

}

from "./init/index.js";

import "./services/firebase/firebase.init.js";




export async function bootstrap(){


try{


console.log(

"🚀 Starting SARPRASIN v2.0.1"

);



await initApplication();



console.log(

"✅ SARPRASIN Ready"

);



}

catch(error){



console.error(

"❌ Application Failed",

error

);



}

}
