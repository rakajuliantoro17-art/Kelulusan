/*
==================================================

LOGGER SERVICE

==================================================
*/


const logs=[];



export function log(

message,

level="INFO"

){



const data={


id:

Date.now(),


message,


level,


time:

new Date()


};



logs.push(data);



console.log(

`[${level}]`,

message

);



return data;


}







export function logError(

error

){



return log(

error.message,

"ERROR"

);


}







export function getLogs(){



return logs;


}
