import {

bootstrap

}

from "./bootstrap.js";


import {

handleError

}

from "./services/system/error.service.js";




window.onerror=

(

message,

source,

line,

column,

error

)=>{


handleError(

error ||

new Error(message),

{


source,

line,

column

}


);



};





bootstrap();
