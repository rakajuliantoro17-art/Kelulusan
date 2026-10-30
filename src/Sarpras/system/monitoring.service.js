/*
==================================================

MONITORING SERVICE

==================================================
*/


export function trackEvent(

event,

data={}

){



console.log(

"EVENT",

{


event,

data,

time:

new Date()


}

);



}
