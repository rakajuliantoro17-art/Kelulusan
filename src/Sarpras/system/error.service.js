/*
==================================================

ERROR SERVICE

==================================================
*/


import {

logError

}

from "./logger.service.js";




export function handleError(

error,

context={}

){



const errorData={


message:

error.message || "Unknown Error",


stack:

error.stack,


context,


time:

new Date()


};





logError(

errorData

);



showUserError(

errorData

);



return errorData;


}







function showUserError(

error

){



console.error(

error

);


}
