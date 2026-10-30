import {

QR_PREFIX,

QR_VERSION,

QR_SEPARATOR

}

from "./qr.constants.js";

export function generatePayload(asset){

    return [

        QR_PREFIX,

        QR_VERSION,

        asset.id,

        asset.code,

        asset.room

    ].join(QR_SEPARATOR);

}
