/*
==================================================

AUTH GUARD

==================================================
*/


import {

getCurrentUser

}

from "../store/auth.store.js";






export async function checkAuthGuard(

route

){



if(

!route.auth

)

return true;





const user=

getCurrentUser();





if(!user){



window.history.pushState(

{},

"",

"/login"

);



location.reload();



return false;


}






if(

route.roles

&&

!route.roles.includes(

user.role

)

){



window.history.pushState(

{},

"",

"/unauthorized"

);



location.reload();



return false;


}





return true;


}
