const queue=[];

let running=false;

export async function enqueue(task){

    queue.push(task);

    if(running){

        return;

    }

    running=true;

    while(queue.length){

        const job=

        queue.shift();

        await job();

    }

    running=false;

}
