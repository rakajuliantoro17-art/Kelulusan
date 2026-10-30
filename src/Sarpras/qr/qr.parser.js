import {

QR_SEPARATOR

}

from "./qr.constants.js";

export function parsePayload(text){

    const [

        prefix,

        version,

        id,

        code,

        room

    ] = text.split(QR_SEPARATOR);

    return{

        prefix,

        version,

        id,

        code,

        room

    };

}
