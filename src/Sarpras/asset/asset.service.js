/*
==================================================
SARPRASIN v2.0

ASSET SERVICE

==================================================
*/


import {


findAll,
findById,
create,
update,
remove


}

from "./asset.repository.js";



import {


mapAsset


}

from "./asset.mapper.js";



import {


validateAsset


}

from "./asset.validator.js";



import {


setCache,
getCache


}

from "./asset.cache.js";







export const assetService={





async getAssets(){



const cached =

getCache(
"assets"
);



if(cached){


return cached;


}





const snapshot =

await findAll();





const assets =

snapshot.docs.map(

mapAsset

);





setCache(
"assets",
assets
);





return assets;


},









async getAssetById(
id
){



const snapshot =

await findById(id);



if(!snapshot.exists())


return null;



return mapAsset(snapshot);



},







async createAsset(
data
){



const validation =

validateAsset(data);





if(!validation.valid){


throw new Error(

validation.errors.join(",")

);


}





return await create(data);


},









async updateAsset(
id,
data
){


return await update(
id,
data
);


},







async deleteAsset(
id
){


return await remove(id);


},








async search(
keyword
){



const assets =

await this.getAssets();





return assets.filter(

item=>

item.name

.toLowerCase()

.includes(

keyword.toLowerCase()

)

);



}



};
