/*
==================================================

STORE INITIALIZER

==================================================
*/


import {

initializeStore

}

from "../store/index.js";

import {

authListener,

getById,

COLLECTION

}

from "../services/firebase/index.js";

import {

setUser,

logoutUser

}

from "../store/auth.store.js";




export async function initStore(){


initializeStore();


// Rehidrasi status login dari sesi Firebase yang sudah
// tersimpan di browser -- wajib untuk multi-page app,
// karena store di memori kosong lagi tiap pindah halaman.
// Sekaligus ambil field "role" dari Firestore (Firebase
// Auth sendiri tidak punya field role), karena auth-guard
// butuh user.role untuk cek akses per dashboard.
await new Promise((resolve) => {

    authListener(async (authUser) => {

        if (!authUser) {
            logoutUser();
            resolve();
            return;
        }

        let role = null;

        try {

            const profileSnap = await getById(COLLECTION.USERS, authUser.uid);
            role = profileSnap.exists() ? profileSnap.data().role : null;

        } catch (error) {

            console.error("Gagal ambil profil user:", error);

        }

        setUser({

            uid: authUser.uid,
            email: authUser.email,
            role

        });

        resolve();

    });

});


console.log(

"Store ready"

);


}
