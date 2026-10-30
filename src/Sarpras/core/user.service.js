// ======================================================
// User Service
// Sarprasin v2.0
// ======================================================

import {
    COLLECTION,
    createWithId,
    update,
    remove,
    getAll,
    getById,
    getWhere
} from "../firebase";

import { getCurrentUser } from "../firebase";

/* ======================================================
   USER ROLE
====================================================== */

export const USER_ROLE = {

    ADMIN: "admin",

    EXECUTIVE: "executive",

    USER: "user"

};

/* ======================================================
   USER STATUS
====================================================== */

export const USER_STATUS = {

    ACTIVE: "aktif",

    INACTIVE: "nonaktif"

};

/* ======================================================
   GET CURRENT PROFILE
====================================================== */

export async function getCurrentProfile() {

    const authUser = getCurrentUser();

    if (!authUser) return null;

    return await getById(
        COLLECTION.USERS,
        authUser.uid
    );

}

/* ======================================================
   GET ALL USER
====================================================== */

export async function getUsers() {

    return await getAll(COLLECTION.USERS);

}

/* ======================================================
   GET USER
====================================================== */

export async function getUser(uid) {

    return await getById(
        COLLECTION.USERS,
        uid
    );

}

/* ======================================================
   CREATE USER PROFILE
====================================================== */

export async function createUser(uid, data) {

    await createWithId(
        COLLECTION.USERS,
        uid,
        data
    );

    return true;

}

/* ======================================================
   UPDATE USER
====================================================== */

export async function updateUser(uid, data) {

    await update(
        COLLECTION.USERS,
        uid,
        data
    );

    return true;

}

/* ======================================================
   DELETE USER
====================================================== */

export async function deleteUser(uid) {

    await remove(
        COLLECTION.USERS,
        uid
    );

    return true;

}

/* ======================================================
   GET USER BY ROLE
====================================================== */

export async function getUserByRole(role) {

    return await getWhere(
        COLLECTION.USERS,
        "level",
        "==",
        role
    );

}

/* ======================================================
   GET ACTIVE USER
====================================================== */

export async function getActiveUsers() {

    return await getWhere(
        COLLECTION.USERS,
        "status",
        "==",
        USER_STATUS.ACTIVE
    );

}

/* ======================================================
   CHECK ROLE
====================================================== */

export function hasRole(user, role) {

    return user?.level === role;

}

/* ======================================================
   CHECK ACTIVE
====================================================== */

export function isActive(user) {

    return user?.status === USER_STATUS.ACTIVE;

}
