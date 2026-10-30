/*
==================================================

AUTH STORE

==================================================
*/


import {

createStore,

getState,

setState

}

from "./index.js";





createStore(

"auth",

{


user:null,


authenticated:false



}

);






export function setUser(

user

){



setState(

"auth",

{


user,


authenticated:true


}

);


}






export function logoutUser(){



setState(

"auth",

{


user:null,


authenticated:false


}

);


}






export function getCurrentUser(){



return getState(

"auth"

)

.user;


}
