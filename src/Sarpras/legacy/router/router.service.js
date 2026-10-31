/*
==================================================

ROUTER SERVICE

==================================================
*/


import {

navigate

}

from "./index.js";





export function go(

path

){



navigate(path);


}






export function back(){



window.history.back();


}





export function refresh(){



location.reload();


}
