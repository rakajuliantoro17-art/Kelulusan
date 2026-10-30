// ======================================================
// Token Service
// Sarprasin v2.0
// ======================================================

import {
    auth
} from "../firebase";

/* ======================================================
   TOKEN CACHE
====================================================== */

let idToken = null;

/* ======================================================
   GET ID TOKEN
====================================================== */

export async function getIdToken(forceRefresh = false) {

    const user = auth.currentUser;

    if (!user) {

        return null;

    }

    idToken = await user.getIdToken(forceRefresh);

    return idToken;

}

/* ======================================================
   REFRESH TOKEN
====================================================== */

export async function refreshToken() {

    return await getIdToken(true);

}

/* ======================================================
   CLEAR TOKEN
====================================================== */

export function clearToken() {

    idToken = null;

}

/* ======================================================
   TOKEN EXIST
====================================================== */

export function hasToken() {

    return idToken !== null;

}

/* ======================================================
   GET CACHE
====================================================== */

export function getCachedToken() {

    return idToken;

}

/* ======================================================
   AUTH HEADER
====================================================== */

export async function getAuthorizationHeader() {

    const token = await getIdToken();

    return {

        Authorization: `Bearer ${token}`

    };

}
