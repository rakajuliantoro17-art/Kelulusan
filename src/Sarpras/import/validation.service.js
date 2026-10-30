/*
==========================================================
Sarprasin 2.0
Import Validation Service
File : src/services/import/validation.service.js
Version : 2.0.0
==========================================================
*/

class ImportValidationService {

    /* ==========================================
       REQUIRED COLUMNS
    ========================================== */

    validateHeaders(

        headers = [],

        required = []

    ) {

        const missing = required.filter(

            column => !headers.includes(column)

        );

        return {

            valid: missing.length === 0,

            missing

        };

    }

    /* ==========================================
       EMPTY ROW
    ========================================== */

    validateEmptyRows(data = []) {

        const invalidRows = [];

        data.forEach((row, index) => {

            const values = Object.values(row);

            const empty = values.every(value =>

                value === "" ||

                value === null ||

                value === undefined

            );

            if (empty) {

                invalidRows.push(index + 2);

            }

        });

        return {

            valid: invalidRows.length === 0,

            invalidRows

        };

    }

    /* ==========================================
       REQUIRED FIELD
    ========================================== */

    validateRequiredFields(

        data = [],

        fields = []

    ) {

        const errors = [];

        data.forEach((row, index) => {

            fields.forEach(field => {

                if (

                    row[field] === "" ||

                    row[field] === null ||

                    row[field] === undefined

                ) {

                    errors.push({

                        row: index + 2,

                        field

                    });

                }

            });

        });

        return {

            valid: errors.length === 0,

            errors

        };

    }

    /* ==========================================
       DUPLICATE
    ========================================== */

    validateDuplicate(

        data = [],

        key

    ) {

        const seen = new Set();

        const duplicate = [];

        data.forEach((row, index) => {

            const value = row[key];

            if (seen.has(value)) {

                duplicate.push({

                    row: index + 2,

                    value

                });

            }

            seen.add(value);

        });

        return {

            valid: duplicate.length === 0,

            duplicate

        };

    }

    /* ==========================================
       MAX ROW
    ========================================== */

    validateMaxRows(

        data = [],

        max = 5000

    ) {

        return {

            valid: data.length <= max,

            total: data.length,

            max

        };

    }

    /* ==========================================
       VALIDATE
    ========================================== */

    validate({

        headers = [],

        data = [],

        requiredHeaders = [],

        requiredFields = [],

        uniqueField = null,

        maxRows = 5000

    }) {

        return {

            headers:

                this.validateHeaders(

                    headers,

                    requiredHeaders

                ),

            emptyRows:

                this.validateEmptyRows(

                    data

                ),

            required:

                this.validateRequiredFields(

                    data,

                    requiredFields

                ),

            duplicate:

                uniqueField

                    ? this.validateDuplicate(

                        data,

                        uniqueField

                    )

                    : {

                        valid: true,

                        duplicate: []

                    },

            maxRows:

                this.validateMaxRows(

                    data,

                    maxRows

                )

        };

    }

}

const importValidationService =

    new ImportValidationService();

export default importValidationService;

export {

    ImportValidationService

};
