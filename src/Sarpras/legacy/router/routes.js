/*
==================================================

SARPRASIN v2.0.2

ROUTE CONFIGURATION

==================================================
*/


export const routes=[



/*
====================
PUBLIC ROUTES
====================
*/


{

path:"/",

page:"public/home.html",

public:true

},



{

path:"/login",

page:"public/login.html",

public:true

},



{

path:"/forgot-password",

page:"public/forgot-password.html",

public:true

},



{

path:"/help",

page:"public/help.html",

public:true

},



{

path:"/contact",

page:"public/contact.html",

public:true

},





/*
====================
SYSTEM ROUTES
====================
*/


{

path:"/offline",

page:"public/offline.html",

public:true

},



{

path:"/maintenance",

page:"public/maintenance.html",

public:true

},






/*
====================
PRIVATE ROUTES
====================
*/


{

path:"/dashboard",

page:"dashboard/index.html",

auth:true,

roles:[

"ADMIN",

"OPERATOR",

"PIMPINAN"

]

},



{

path:"/assets",

page:"dashboard/assets.html",

auth:true,

roles:[

"ADMIN",

"OPERATOR"

]

}



];
