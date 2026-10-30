/*
==================================================

SARPRASIN v2.0

QUEUE SERVICE

Central Task Queue Manager

Version : 2.0.0

==================================================
*/


import {

QUEUE_STATUS,

QUEUE_PRIORITY

}

from "./system.constants.js";









/*
==================================================
QUEUE STORAGE

==================================================
*/


const queue=[];


let running=false;


let activeTask=null;









/*
==================================================
CREATE TASK ID

==================================================
*/


function createTaskId(){


return (

"JOB-" +

Date.now()

);

}









/*
==================================================
ADD TASK

==================================================
*/


export function addQueue(

task,

options={}

){



const job={



id:

createTaskId(),



task,



name:

options.name || "unknown",



priority:

options.priority ||

QUEUE_PRIORITY.NORMAL,



status:

QUEUE_STATUS.PENDING,



createdAt:

new Date()



};





queue.push(job);





sortQueue();





return job.id;


}









/*
==================================================
SORT PRIORITY

==================================================
*/


function sortQueue(){



queue.sort(

(a,b)=>

b.priority -

a.priority

);



}









/*
==================================================
RUN QUEUE

==================================================
*/


export async function processQueue(){



if(running)

return;




running=true;





while(queue.length){



const job=

queue.shift();



activeTask=job;



try{


job.status=

QUEUE_STATUS.RUNNING;





await job.task();





job.status=

QUEUE_STATUS.SUCCESS;



}

catch(error){



job.status=

QUEUE_STATUS.FAILED;



console.error(

"Queue Error",

error

);



}





}





activeTask=null;


running=false;


}









/*
==================================================
QUEUE WRAPPER

Auto Execute

==================================================
*/


export async function queueTask(

name,

callback,

options={}

){



addQueue(

callback,

{

...options,

name

}

);



return processQueue();


}









/*
==================================================
GET QUEUE STATUS

==================================================
*/


export function getQueueStatus(){



return{


pending:

queue.length,


running,


active:

activeTask

?



activeTask.name

:

null


};


}









/*
==================================================
CLEAR QUEUE

==================================================
*/


export function clearQueue(){


queue.length=0;


}









/*
==================================================
RETRY FAILED TASK

==================================================
*/


export async function retryTask(

job

){



return addQueue(

job.task,

{

name:

job.name,

priority:

job.priority

}

);


}
