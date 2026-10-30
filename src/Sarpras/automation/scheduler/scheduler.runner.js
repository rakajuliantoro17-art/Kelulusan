import {

executeScheduler

}

from "./scheduler.engine.js";

export function startScheduler(){

    executeScheduler();

    setInterval(

        executeScheduler,

        60000

    );

}
