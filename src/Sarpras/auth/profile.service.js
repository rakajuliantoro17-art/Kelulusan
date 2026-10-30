// ======================================================
// Profile Service
// Sarprasin v2.0
// Current User Profile Management
// ======================================================

import {
    getCurrentProfile,
    updateUser
} from "../core/user.service.js";

import {
    currentUser
} from "./auth.service.js";

/* ======================================================
   GET PROFILE
====================================================== */

export async function getProfile() {

    return await getCurrentProfile();

}

/* ======================================================
   REFRESH PROFILE
====================================================== */

export async function refreshProfile() {

    return await getCurrentProfile();

}

/* ======================================================
   UPDATE PROFILE
====================================================== */

export async function updateProfile(data = {}) {

    const auth = currentUser();

    if (!auth) {

        throw new Error("AUTH_REQUIRED");

    }

    await updateUser(auth.uid, {

        ...data,

        updatedAt: new Date().toISOString()

    });

    return await getCurrentProfile();

}

/* ======================================================
   GET DISPLAY NAME
====================================================== */

export async function getDisplayName() {

    const profile = await getCurrentProfile();

    return profile?.nama || profile?.username || "Pengguna";

}

/* ======================================================
   GET USER INITIAL
====================================================== */

export async function getInitial() {

    const name = await getDisplayName();

    return name
        .split(" ")
        .map(word => word.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();

}

/* ======================================================
   GET PHOTO
====================================================== */

export async function getPhotoURL() {

    const profile = await getCurrentProfile();

    return profile?.photoURL || null;

}

/* ======================================================
   CHECK PROFILE COMPLETE
====================================================== */

export async function isProfileComplete() {

    const profile = await getCurrentProfile();

    if (!profile) return false;

    return Boolean(

        profile.nama &&
        profile.email &&
        profile.level &&
        profile.status

    );

}
