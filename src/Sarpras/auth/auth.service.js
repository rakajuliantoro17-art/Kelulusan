/*
==================================================

AUTH SERVICE

==================================================
*/


import { defaultPath, safeNext } from "../../config/portals.js";
import {

login as firebaseLogin,

logout as firebaseLogout,

getById,

COLLECTION

}

from "../firebase/index.js";

import {

setUser,

logoutUser

}

from "../../store/auth.store.js";

import {

saveSession,

clearSession,

getSession

}

from "./session.service.js";








export async function login(

email,

password

){


const authUser =
await firebaseLogin(email, password);


const profileSnap =
await getById(COLLECTION.USERS, authUser.uid);


if (!profileSnap.exists()) {

    await firebaseLogout();

    throw new Error(
        "Akun ini belum terdaftar sebagai user aplikasi. Hubungi admin."
    );

}


const profile =
profileSnap.data();


const user = {

    uid: authUser.uid,
    email: authUser.email,
    role: profile.role,
    name: profile.name || authUser.email

};


setUser(user);

saveSession(user);


const next = safeNext(
    new URLSearchParams(window.location.search).get("next"),
    user.role
);

window.location.href =
next || defaultPath(user.role) || "/";


return user;


}




export async function logout(){


await firebaseLogout();

logoutUser();

clearSession();


window.location.href = "/login";


}


export function getCurrentUser(){


return getSession();


}
