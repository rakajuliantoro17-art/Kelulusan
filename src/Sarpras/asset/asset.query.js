/*
==================================================
ASSET QUERY BUILDER

==================================================
*/


import {


query,
where,
orderBy


}

from "firebase/firestore";





export function assetFilter(
collectionRef,
field,
value
){


return query(

collectionRef,

where(
field,
"==",
value
)

);


}






export function assetSort(
collectionRef
){


return query(

collectionRef,

orderBy(
"createdAt",
"desc"
)

);


}
