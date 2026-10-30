/*
==================================================

TABLE UTILITIES

==================================================
*/


export function sortData(

data,

field,

direction="asc"

){



return [...data]

.sort(

(a,b)=>{


if(

direction==="asc"

)

return a[field]>b[field]?1:-1;


return a[field]<b[field]?1:-1;


}

);



}





export function paginate(

data,

page,

size

){



const start=

(page-1)*size;



return data.slice(

start,

start+size

);


}
