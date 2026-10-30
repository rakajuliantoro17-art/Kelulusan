/*
==========================================================
Sarprasin 2.0
API Service
File : src/services/api/api.service.js
Version : 2.0.0
==========================================================
*/

import {

    API_BASE_URL,
    API_TIMEOUT,
    API_HEADERS

} from "../../config/env.js";

class ApiService {

    constructor() {

        this.baseURL = API_BASE_URL || "";

        this.timeout = API_TIMEOUT || 30000;

        this.defaultHeaders = {

            "Content-Type": "application/json",

            ...API_HEADERS

        };

    }

    /* ==================================================
       URL
    ================================================== */

    url(endpoint = "") {

        return `${this.baseURL}${endpoint}`;

    }

    /* ==================================================
       REQUEST
    ================================================== */

    async request(

        endpoint,

        options = {}

    ) {

        const controller =

            new AbortController();

        const timeout =

            setTimeout(

                () => controller.abort(),

                this.timeout

            );

        try {

            const response =

                await fetch(

                    this.url(endpoint),

                    {

                        ...options,

                        headers: {

                            ...this.defaultHeaders,

                            ...(options.headers || {})

                        },

                        signal:

                            controller.signal

                    }

                );

            clearTimeout(timeout);

            const contentType =

                response.headers.get(

                    "content-type"

                ) || "";

            const data =

                contentType.includes(

                    "application/json"

                )

                    ? await response.json()

                    : await response.text();

            return {

                success:

                    response.ok,

                status:

                    response.status,

                data

            };

        }

        catch (error) {

            clearTimeout(timeout);

            return {

                success: false,

                status: 0,

                error:

                    error.message

            };

        }

    }

    /* ==================================================
       GET
    ================================================== */

    get(

        endpoint,

        headers = {}

    ) {

        return this.request(

            endpoint,

            {

                method: "GET",

                headers

            }

        );

    }

    /* ==================================================
       POST
    ================================================== */

    post(

        endpoint,

        body = {},

        headers = {}

    ) {

        return this.request(

            endpoint,

            {

                method: "POST",

                headers,

                body:

                    JSON.stringify(body)

            }

        );

    }

    /* ==================================================
       PUT
    ================================================== */

    put(

        endpoint,

        body = {},

        headers = {}

    ) {

        return this.request(

            endpoint,

            {

                method: "PUT",

                headers,

                body:

                    JSON.stringify(body)

            }

        );

    }

    /* ==================================================
       PATCH
    ================================================== */

    patch(

        endpoint,

        body = {},

        headers = {}

    ) {

        return this.request(

            endpoint,

            {

                method: "PATCH",

                headers,

                body:

                    JSON.stringify(body)

            }

        );

    }

    /* ==================================================
       DELETE
    ================================================== */

    delete(

        endpoint,

        headers = {}

    ) {

        return this.request(

            endpoint,

            {

                method: "DELETE",

                headers

            }

        );

    }

    /* ==================================================
       FILE
    ================================================== */

    upload(

        endpoint,

        formData,

        headers = {}

    ) {

        return this.request(

            endpoint,

            {

                method: "POST",

                headers,

                body: formData

            }

        );

    }

}

const apiService =

    new ApiService();

export default apiService;

export {

    ApiService

};
