/*
==================================================
ROUTE LAZY LOADER

==================================================
*/


export async function loadPage(
url
){



try{


const response =

await fetch(url);



return await response.text();



}


catch(error){


console.error(error);


return null;


}


}
