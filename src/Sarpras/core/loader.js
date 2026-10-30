/*
==================================================

COMPONENT LOADER

==================================================
*/


export async function loadComponent(

path

){



const response=

await fetch(

path

);



return await response.text();


}
