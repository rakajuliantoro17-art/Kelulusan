/*
==================================================
ASSET REPOSITORY

Firestore Access Layer

==================================================
*/


import {


db


}

from "../../config/firebase.js";



import {


collection,
getDocs,
doc,
getDoc,
addDoc,
updateDoc,
deleteDoc


}

from "firebase/firestore";




const assetCollection =

collection(
db,
"assets"
);





export async function findAll(){


return await getDocs(
assetCollection
);


}





export async function findById(
id
){


return await getDoc(

doc(
db,
"assets",
id
)

);


}





export async function create(
data
){


return await addDoc(

assetCollection,

data

);


}





export async function update(
id,
data
){



return await updateDoc(

doc(
db,
"assets",
id
),

data

);


}





export async function remove(
id
){


return await deleteDoc(

doc(
db,
"assets",
id

)

);


}
