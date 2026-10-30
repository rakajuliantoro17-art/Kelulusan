/*
==========================================================
SARPRASIN v2.0
Firebase Service Barrel + Helper Layer

File ini menggabungkan file-file raw Firebase SDK
(firebase.init/auth/firestore/storage.js) menjadi
fungsi siap-pakai yang dibutuhkan seluruh aplikasi.
==========================================================
*/

import { app } from "./firebase.init.js";

import {
    auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from "./firebase.auth.js";

import {
    db,
    collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
    query, where, orderBy, limit
} from "./firebase.firestore.js";

import {
    storage,
    ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject
} from "./firebase.storage.js";

import { callFunction } from "./firebase.functions.js";
export { createAuthAccount } from "./firebase.accounts.js";

import {
    trackEvent,
    EVENTS,
    initializeAnalytics
} from "./firebase.analytics.js";

export { app, auth, db, storage, trackEvent, EVENTS, initializeAnalytics, callFunction };


// ======================================================
// COLLECTION NAMES
// ======================================================

export const COLLECTION = {
    USERS: "users",
    ASSETS: "assets",
    ROOMS: "rooms",
    MAINTENANCE: "maintenance",
    REPORTS: "reports",
    LOGS: "logs",
    MASTER: "master",
    BUILDINGS: "buildings",
    PROCUREMENTS: "procurements",
    PUBLIC_SUMMARY: "publicSummary"
};


// ======================================================
// AUTH HELPERS
// ======================================================

export async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
}

export async function register(email, password) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
}

export async function logout() {
    return await signOut(auth);
}

export async function resetPassword(email) {
    return await sendPasswordResetEmail(auth, email);
}

export function getCurrentUser() {
    return auth.currentUser;
}

export function authListener(callback) {
    return onAuthStateChanged(auth, callback);
}


// ======================================================
// FIRESTORE HELPERS
// ======================================================

export async function getAll(collectionName) {
    return await getDocs(collection(db, collectionName));
}

export async function getById(collectionName, id) {
    return await getDoc(doc(db, collectionName, id));
}

export async function create(collectionName, data) {
    return await addDoc(collection(db, collectionName), data);
}

export async function createWithId(collectionName, id, data) {
    return await setDoc(doc(db, collectionName, id), data);
}

export async function update(collectionName, id, data) {
    return await updateDoc(doc(db, collectionName, id), data);
}

export async function remove(collectionName, id) {
    return await deleteDoc(doc(db, collectionName, id));
}

export async function getWhere(collectionName, field, operator, value) {
    const q = query(collection(db, collectionName), where(field, operator, value));
    return await getDocs(q);
}

export async function getOrdered(collectionName, field, direction = "asc") {
    const q = query(collection(db, collectionName), orderBy(field, direction));
    return await getDocs(q);
}

export async function getLimited(collectionName, max) {
    const q = query(collection(db, collectionName), limit(max));
    return await getDocs(q);
}


// ======================================================
// STORAGE HELPERS
// ======================================================

export async function uploadFile(path, file) {
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
}

export function uploadFileWithProgress(path, file, onProgress, onComplete, onError) {
    const fileRef = ref(storage, path);
    const task = uploadBytesResumable(fileRef, file);

    task.on(
        "state_changed",
        (snapshot) => {
            const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(percent);
        },
        (error) => {
            if (onError) onError(error);
        },
        async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            if (onComplete) onComplete(url);
        }
    );

    return task;
}

export async function deleteFile(path) {
    return await deleteObject(ref(storage, path));
}
