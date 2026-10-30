export function logJob(name,status,message=""){

    console.info(

        `[Scheduler] ${name}`,

        status,

        message

    );

}
