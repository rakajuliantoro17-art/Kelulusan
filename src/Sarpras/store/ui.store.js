/*
==================================================

UI STATE

==================================================
*/


import {

createStore,

setState

}

from "./index.js";





createStore(

"ui",

{


theme:"light",


sidebar:true,


modal:null,


loading:false


}

);






export function toggleSidebar(){



const state=

getState(

"ui"

);





setState(

"ui",

{


sidebar:

!state.sidebar


}

);


}
