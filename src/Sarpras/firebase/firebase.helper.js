export function generateId() {

    return crypto.randomUUID();

}

export function now() {

    return new Date();

}

export function timestamp() {

    return Date.now();

}
