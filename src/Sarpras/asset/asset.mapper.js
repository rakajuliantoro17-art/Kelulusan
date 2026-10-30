/*
==================================================
ASSET DATA MAPPER

==================================================
*/


export function mapAsset(
doc
){


const data =
doc.data();



return {


id:doc.id,


code:data.code || "",


name:data.name || "",


category:data.category || "",


room:data.room || null,


status:data.status || "active",


condition:data.condition || "good",


createdAt:data.createdAt || null,


updatedAt:data.updatedAt || null



};


}
