/*
==================================================

USER MANAGEMENT

ADMIN ONLY

==================================================
*/


export async function createUser(

data

){



/*

Nanti:

Firebase Auth

+

Firestore

*/


const user={


...data,


createdAt:new Date()


};




console.log(

"Create User",

user

);



return user;


}
