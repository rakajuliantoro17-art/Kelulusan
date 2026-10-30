/*
==========================================================
SARPRASIN v2.0
SMANSASOO Digital System

Application Routes Configuration
Version : 1.1.0
==========================================================
*/


import {
    USER_ROLE
}
from "./constant.js";




// ======================================================
// PUBLIC ROUTES (tanpa login)
// ======================================================

export const PUBLIC_ROUTES = [

    {
        name: "Login",
        path: "/login",
        page: "login",
        title: "Login - SARPRASIN",
        auth: false
    },

    {
        name: "Publik",
        path: "/public",
        page: "public",
        title: "SARPRASIN - Ringkasan Publik",
        auth: false
    }

];




// ======================================================
// DASHBOARD ROUTES (butuh login, dibatasi role)
// ======================================================

export const APP_ROUTES = [

    {
        name: "Dashboard Admin",
        path: "/admin",
        page: "admin",
        title: "Dashboard Admin",
        icon: "layout-dashboard",
        auth: true,
        roles: [
            USER_ROLE.ADMIN,
            USER_ROLE.WAKA_SARPRAS,
            USER_ROLE.STAFF,
            USER_ROLE.ARSIPARIS
        ]
    },

    {
        name: "Dashboard Eksekutif",
        path: "/executive",
        page: "executive",
        title: "Dashboard Eksekutif",
        icon: "chart-no-axes-combined",
        auth: true,
        roles: [
            USER_ROLE.ADMIN,
            USER_ROLE.WAKA_SARPRAS
        ]
    },

    {
        name: "Dashboard User",
        path: "/user",
        page: "user",
        title: "Dashboard User",
        icon: "user",
        auth: true,
        roles: [
            USER_ROLE.OPERATOR,
            USER_ROLE.STAFF,
            USER_ROLE.GURU,
            USER_ROLE.WALI_KELAS,
            USER_ROLE.VIEWER
        ]
    }

];




// ======================================================
// SUB-HALAMAN ADMIN (rencana ke depan, belum ada file-nya)
// Nanti ini jadi bagian/tab di dalam Dashboard Admin,
// bukan dashboard terpisah -- makanya belum masuk
// APP_ROUTES di atas.
// ======================================================

export const ADMIN_SECTIONS = [

    { name: "Asset", page: "asset", icon: "package" },
    { name: "Room", page: "room", icon: "building" },
    { name: "Maintenance", page: "maintenance", icon: "wrench" },
    { name: "Report", page: "report", icon: "file-text" },
    { name: "Settings", page: "settings", icon: "settings" }

];




// ======================================================
// ERROR ROUTES
// ======================================================

export const ERROR_ROUTES = [

    {
        name: "Not Found",
        path: "*",
        page: "404",
        title: "Page Not Found"
    },

    {
        name: "Maintenance",
        path: "/system-maintenance",
        page: "maintenance",
        title: "System Maintenance"
    }

];




// ======================================================
// ROUTE HELPERS
// ======================================================

export function getRouteByPath(path) {

    return [
        ...PUBLIC_ROUTES,
        ...APP_ROUTES,
        ...ERROR_ROUTES
    ]
    .find(route => route.path === path);

}


export function getRouteByName(name) {

    return [
        ...PUBLIC_ROUTES,
        ...APP_ROUTES,
        ...ERROR_ROUTES
    ]
    .find(route => route.name === name);

}


// Catatan: role VIEWER punya akses ke Dashboard User,
// tapi kemampuan INPUT data hanya untuk viewer yang
// ditandai ketua kelas. Itu tidak dicek di sini (level
// route), tapi di level komponen lewat field terpisah,
// misalnya profil user punya "isKetuaKelas: true".
export function checkRouteAccess(route, userRole) {

    if (!route.auth) {
        return true;
    }

    if (!route.roles) {
        return false;
    }

    return route.roles.includes(userRole);

}
