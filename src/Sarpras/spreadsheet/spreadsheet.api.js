const BASE_URL =

import.meta.env.VITE_SPREADSHEET_API;

export async function request(

action,

payload={}

){

    const response=

    await fetch(BASE_URL,{

        method:"POST",

        headers:{

            "Content-Type":

            "application/json"

        },

        body:JSON.stringify({

            action,

            ...payload

        })

    });

    return await response.json();

}
