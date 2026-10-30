import {

assetService

}

from "../asset/asset.service.js";

export async function findAssetByQR(id){

    return await assetService.getAssetById(id);

}
