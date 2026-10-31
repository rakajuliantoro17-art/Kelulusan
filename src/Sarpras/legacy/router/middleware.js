/*
==================================================

ROUTE MIDDLEWARE

==================================================
*/


const middleware=[];



export function addMiddleware(

callback

){



middleware.push(

callback

);


}





export async function runMiddleware(

context

){



for(

const fn of middleware

){



const result=

await fn(context);



if(result===false)

return false;



}





return true;


}
