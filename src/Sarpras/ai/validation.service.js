/*
==========================================================
Sarprasin 2.0
Validation Service
File : src/services/ai/validation.service.js
Version : 2.0.0
==========================================================
*/

class ValidationService {

    constructor() {

        this.requiredFields = [

            "assetCode",

            "name",

            "category",

            "room"

        ];

    }

    /* ==================================================
       REQUIRED
    ================================================== */

    validateRequired(asset = {}) {

        const errors = [];

        this.requiredFields.forEach(field => {

            if (

                asset[field] === undefined ||

                asset[field] === null ||

                asset[field] === ""

            ) {

                errors.push({

                    field,

                    message:

                        `${field} wajib diisi.`

                });

            }

        });

        return errors;

    }

    /* ==================================================
       INVENTORY CODE
    ================================================== */

    validateInventoryCode(code = "") {

        return /^[A-Z0-9\-]+$/

            .test(code);

    }

    /* ==================================================
       SERIAL NUMBER
    ================================================== */

    validateSerialNumber(serial = "") {

        return serial.length >= 5;

    }

    /* ==================================================
       DATE
    ================================================== */

    validateDate(date) {

        return !Number.isNaN(

            new Date(date).getTime()

        );

    }

    /* ==================================================
       CONDITION
    ================================================== */

    validateCondition(score = 100) {

        return (

            score >= 0 &&

            score <= 100

        );

    }

    /* ==================================================
       LOCATION
    ================================================== */

    validateLocation(room = "") {

        return room.trim().length > 0;

    }

    /* ==================================================
       QR CODE
    ================================================== */

    validateQRCode(value = "") {

        return value.trim().length > 0;

    }

    /* ==================================================
       ASSET
    ================================================== */

    validateAsset(asset = {}) {

        const errors = [];

        errors.push(

            ...this.validateRequired(asset)

        );

        if (

            asset.assetCode &&

            !this.validateInventoryCode(

                asset.assetCode

            )

        ) {

            errors.push({

                field: "assetCode",

                message:

                    "Format kode inventaris tidak valid."

            });

        }

        if (

            asset.serialNumber &&

            !this.validateSerialNumber(

                asset.serialNumber

            )

        ) {

            errors.push({

                field: "serialNumber",

                message:

                    "Nomor seri tidak valid."

            });

        }

        if (

            asset.purchaseDate &&

            !this.validateDate(

                asset.purchaseDate

            )

        ) {

            errors.push({

                field: "purchaseDate",

                message:

                    "Tanggal pembelian tidak valid."

            });

        }

        if (

            asset.conditionScore !== undefined &&

            !this.validateCondition(

                asset.conditionScore

            )

        ) {

            errors.push({

                field: "conditionScore",

                message:

                    "Nilai kondisi harus 0–100."

            });

        }

        if (

            asset.room &&

            !this.validateLocation(

                asset.room

            )

        ) {

            errors.push({

                field: "room",

                message:

                    "Lokasi tidak valid."

            });

        }

        if (

            asset.qrCode &&

            !this.validateQRCode(

                asset.qrCode

            )

        ) {

            errors.push({

                field: "qrCode",

                message:

                    "QR Code tidak valid."

            });

        }

        return {

            valid:

                errors.length === 0,

            errors

        };

    }

}

const validationService =

    new ValidationService();

export default validationService;

export {

    ValidationService

};
