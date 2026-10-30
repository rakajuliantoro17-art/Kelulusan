export async function generateSignature(asset){

    const raw=

        asset.id+

        asset.code+

        asset.room;

    const buffer=

    await crypto.subtle.digest(

        "SHA-256",

        new TextEncoder().encode(raw)

    );

    return Array

    .from(new Uint8Array(buffer))

    .map(v=>v.toString(16)

    .padStart(2,"0"))

    .join("");

}
