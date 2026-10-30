/*
==================================================

DEBUG SERVICE

==================================================
*/


let enabled=false;



export function enableDebug(){


enabled=true;


}




export function debug(

message,

data

){



if(!enabled)

return;




console.log(

"[DEBUG]",

message,

data

);



}
