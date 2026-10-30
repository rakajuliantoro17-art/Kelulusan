/*
==================================================
ASSET VALIDATOR

==================================================
*/


export function validateAsset(
data
){



const errors=[];




if(!data.name){


errors.push(
"Nama aset wajib diisi"
);


}





if(!data.category){


errors.push(
"Kategori aset wajib dipilih"
);


}





if(!data.room){


errors.push(
"Lokasi aset wajib diisi"
);


}






return {


valid:
errors.length===0,


errors


};



}
