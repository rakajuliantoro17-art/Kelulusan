/*
==================================================

ERROR STORE

==================================================
*/


import {

createStore,

setState,

getState

}

from "./index.js";





createStore(

"error",

{


items:[]


}

);






export function addError(

error

){



const state=

getState(

"error"

);



setState(

"error",

{


items:[

error,

...state.items

]

}


);



}
