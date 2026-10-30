const permissions={


SUPER_ADMIN:[

"*"

],


ADMIN_SARPRAS:[

"MANAGE_ASSET",

"MANAGE_USER",

"REPORT"

],


GURU:[

"VIEW_ASSET",

"CREATE_REPORT"

],


TU:[

"VIEW_ASSET"

],


WALIKELAS:[

"VIEW_CLASS_ASSET",

"CREATE_REPORT"

],


KETUA_KELAS:[

"CREATE_REPORT"

]


};






export function hasPermission(

role,

permission

){


const list=

permissions[role] || [];




return (

list.includes("*")

||

list.includes(permission)

);


}
