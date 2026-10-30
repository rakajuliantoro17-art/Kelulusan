import {

ROLES

}

from "./auth.constants.js";




export function isAdmin(

role

){


return [

ROLES.SUPER_ADMIN,

ROLES.ADMIN_SARPRAS

]

.includes(role);


}



export function getRoleName(

role

){



const names={


SUPER_ADMIN:"Super Admin",

ADMIN_SARPRAS:"Admin Sarpras",

STAFF:"Staff",

GURU:"Guru",

TU:"Tata Usaha",

WALIKELAS:"Wali Kelas",

KETUA_KELAS:"Ketua Kelas"


};



return names[role];


}
