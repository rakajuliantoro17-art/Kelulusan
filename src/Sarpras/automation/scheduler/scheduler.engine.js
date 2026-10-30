import {

schedulerJobs

}

from "./scheduler.jobs.js";

import {

enqueue,

processQueue

}

from "./scheduler.queue.js";

export async function executeScheduler(){

    for(const job of schedulerJobs){

        await enqueue(job);

    }

    await processQueue();

}
