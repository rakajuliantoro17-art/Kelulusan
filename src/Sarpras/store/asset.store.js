/*
==================================================

ASSET STORE

==================================================
*/


import {

createStore,

setState,

getState

}

from "./index.js";





createStore(

"asset",

{


items:[],


selected:null,


loading:false,


total:0


}

);







export function setAssets(

assets

){



setState(

"asset",

{


items:assets,


total:assets.length


}

);



}






export function selectAsset(

asset

){



setState(

"asset",

{


selected:asset


}

);



}






export function getAssets(){


return getState(

"asset"

);


}
