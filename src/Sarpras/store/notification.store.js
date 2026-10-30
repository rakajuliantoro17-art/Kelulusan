/*
==================================================

NOTIFICATION STORE

==================================================
*/


import {

createStore,

getState,

setState

}

from "./index.js";





createStore(

"notification",

{


items:[],


unread:0


}

);






export function addNotification(

notification

){



const state=

getState(

"notification"

);





setState(

"notification",

{


items:[

notification,

...state.items

],


unread:

state.unread+1



}

);


}







export function markRead(

id

){



const state=

getState(

"notification"

);





setState(

"notification",

{


items:

state.items.map(

item=>


item.id===id

?

{

...item,

read:true

}

:

item



),


unread:

state.unread-1


}

);



}
