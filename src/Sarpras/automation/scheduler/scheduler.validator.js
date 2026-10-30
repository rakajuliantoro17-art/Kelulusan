export function validateJob(job){

    return(

        typeof job.name==="string" &&

        typeof job.run==="function"

    );

}
