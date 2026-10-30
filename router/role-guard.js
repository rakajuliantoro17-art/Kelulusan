/*
==================================================
ROLE GUARD

==================================================
*/


import {

db

}

from "../config/firebase.js";



import {

doc,
getDoc

}

from "firebase/firestore";





export async function checkRole(
requiredRole
){



const user =

auth.currentUser;



if(!user)

return false;







const snapshot =

await getDoc(

doc(

db,

"users",

user.uid

)

);







if(!snapshot.exists())

return false;







const data =

snapshot.data();






return (

data.role===requiredRole

);


}
