/*
==================================================

SYSTEM HEALTH

==================================================
*/


export async function healthCheck(){



const status={


app:true,


database:false,


network:navigator.onLine,


time:new Date()


};





console.table(status);



return status;


}
