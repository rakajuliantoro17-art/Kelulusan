/*
==================================================

SESSION SERVICE

==================================================
*/


const KEY=

"sarprasin_user";




export function saveSession(

user

){


localStorage.setItem(

KEY,

JSON.stringify(user)

);


}




export function getSession(){


const data=

localStorage.getItem(KEY);



return data

?

JSON.parse(data)

:

null;


}




export function clearSession(){



localStorage.removeItem(KEY);


}
