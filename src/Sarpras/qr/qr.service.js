import {

generatePayload

}

from "./qr.generator.js";

import {

parsePayload

}

from "./qr.parser.js";

import {

validateQR

}

from "./qr.validator.js";

import {

findAssetByQR

}

from "./qr.repository.js";

import {

setQR,

getQR

}

from "./qr.cache.js";

export const qrService={

    generate(asset){

        return generatePayload(asset);

    },

    async scan(text){

        const payload=

        parsePayload(text);

        if(!validateQR(payload)){

            throw new Error(

                "QR Code tidak valid."

            );

        }

        const cached=

        getQR(payload.id);

        if(cached){

            return cached;

        }

        const asset=

        await findAssetByQR(

            payload.id

        );

        setQR(

            payload.id,

            asset

        );

        return asset;

    },

    parse(text){

        return parsePayload(text);

    }

};
