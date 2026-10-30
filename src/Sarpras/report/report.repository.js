import {

assetService

}

from "../asset/asset.service.js";

export async function loadAssetReport(){

    return await assetService.getAssets();

}
