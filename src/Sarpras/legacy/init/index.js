/*
==================================================

SARPRASIN v2.0.1

INITIALIZATION MANAGER

==================================================
*/


import {

initConfig

}

from "./config.init.js";


import {

initServices

}

from "./service.init.js";


import {

initStore

}

from "./store.init.js";


import {

initRouter

}

from "./router.init.js";





export async function initApplication(){



await initConfig();



await initServices();



await initStore();



await initRouter();



}
