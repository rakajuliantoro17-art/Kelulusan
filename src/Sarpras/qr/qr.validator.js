import {

QR_PREFIX,

QR_VERSION

}

from "./qr.constants.js";

export function validateQR(payload){

    if(payload.prefix!==QR_PREFIX){

        return false;

    }

    if(payload.version!==QR_VERSION){

        return false;

    }

    return true;

}
