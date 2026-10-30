/*
==================================================

APPLICATION STORE

==================================================
*/


import {

createStore

}

from "./index.js";




export const appStore=

createStore(

"app",

{


version:"2.0.4",


ready:false,


loading:true,


environment:"development"



}

);





export function setAppReady(){



appStore.ready=true;


appStore.loading=false;


}
