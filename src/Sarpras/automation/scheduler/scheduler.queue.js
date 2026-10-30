const queue=[];

let running=false;

export async function enqueue(job){

    queue.push(job);

}

export async function processQueue(){

    if(running){

        return;

    }

    running=true;

    while(queue.length){

        const job=

        queue.shift();

        await job.run();

    }

    running=false;

}
