// ======================================================
// Guard Service
// Sarprasin v2.0
// Route Protection & Access Control
// ======================================================

import { currentUser } from "./auth.service.js";
import { getCurrentProfile } from "../core/user.service.js";

/* ======================================================
   ROLE
====================================================== */

export const ROLE = {

    ADMIN: "admin",

    EXECUTIVE: "executive",

    USER: "user",

    PUBLIC: "public"

};

/* ======================================================
   CHECK LOGIN
====================================================== */

export async function requireAuth() {

    const user = currentUser();

    if (!user) {

        throw new Error("AUTH_REQUIRED");

    }

    return user;

}

/* ======================================================
   CHECK PROFILE
====================================================== */

export async function requireProfile() {

    const profile = await getCurrentProfile();

    if (!profile) {

        throw new Error("PROFILE_NOT_FOUND");

    }

    if (profile.status !== "aktif") {

        throw new Error("ACCOUNT_DISABLED");

    }

    return profile;

}

/* ======================================================
   CHECK ROLE
====================================================== */

export async function requireRole(...roles) {

    const profile = await requireProfile();

    if (!roles.includes(profile.level)) {

        throw new Error("ACCESS_DENIED");

    }

    return profile;

}

/* ======================================================
   USER PAGE
====================================================== */

export async function guardUser() {

    return await requireRole(

        ROLE.USER,

        ROLE.ADMIN

    );

}

/* ======================================================
   EXECUTIVE PAGE
====================================================== */

export async function guardExecutive() {

    return await requireRole(

        ROLE.EXECUTIVE,

        ROLE.ADMIN

    );

}

/* ======================================================
   ADMIN PAGE
====================================================== */

export async function guardAdmin() {

    return await requireRole(

        ROLE.ADMIN

    );

}

/* ======================================================
   PUBLIC PAGE
====================================================== */

export function guardPublic() {

    return true;

}
