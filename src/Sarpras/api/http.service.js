/*
==========================================================
Sarprasin 2.0
HTTP Service
File : src/services/api/http.service.js
Version : 2.0.0
==========================================================
*/

class HttpService {

    constructor(timeout = 30000) {

        this.timeout = timeout;

    }

    /* ==================================================
       REQUEST
    ================================================== */

    async request(url, options = {}) {

        const controller = new AbortController();

        const timer = setTimeout(() => {

            controller.abort();

        }, this.timeout);

        try {

            const response = await fetch(url, {

                ...options,

                signal: controller.signal

            });

            clearTimeout(timer);

            const type =

                response.headers.get(

                    "content-type"

                ) || "";

            let body = null;

            if (

                type.includes(

                    "application/json"

                )

            ) {

                body = await response.json();

            }

            else {

                body = await response.text();

            }

            return {

                ok: response.ok,

                status: response.status,

                statusText:

                    response.statusText,

                headers:

                    response.headers,

                data: body

            };

        }

        catch (error) {

            clearTimeout(timer);

            return {

                ok: false,

                status: 0,

                statusText:

                    "NETWORK_ERROR",

                error:

                    error.message

            };

        }

    }

    /* ==================================================
       GET
    ================================================== */

    get(url, headers = {}) {

        return this.request(

            url,

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

        url,

        body,

        headers = {}

    ) {

        return this.request(

            url,

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

        url,

        body,

        headers = {}

    ) {

        return this.request(

            url,

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

        url,

        body,

        headers = {}

    ) {

        return this.request(

            url,

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

        url,

        headers = {}

    ) {

        return this.request(

            url,

            {

                method: "DELETE",

                headers

            }

        );

    }

    /* ==================================================
       UPLOAD
    ================================================== */

    upload(

        url,

        formData,

        headers = {}

    ) {

        return this.request(

            url,

            {

                method: "POST",

                headers,

                body: formData

            }

        );

    }

}

const httpService =

    new HttpService();

export default httpService;

export {

    HttpService

};
