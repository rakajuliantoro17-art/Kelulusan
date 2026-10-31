/*
==================================================

SARPRASIN v2.0.2

ROUTER ENGINE

==================================================
*/


import {

routes

}

from "./routes.js";


import {

checkAuthGuard

}

from "./auth-guard.js";




let currentRoute=null;






export function initializeRouter(){



window.addEventListener(

"popstate",

()=>{

navigate(

location.pathname

);

}

);





navigate(

location.pathname

);



}









export async function navigate(

path

){



const route=

routes.find(

item=>

item.path===path

);



if(!route){



return navigate(

"/"

);


}





const allowed=

await checkAuthGuard(

route

);





if(!allowed)

return;





currentRoute=route;



await loadPage(

route.page

);



}









async function loadPage(

page

){



const app=

document.getElementById(

"app"

);





const response=

await fetch(

`/src/pages/${page}`

);



const html=

await response.text();





app.innerHTML=html;



}
