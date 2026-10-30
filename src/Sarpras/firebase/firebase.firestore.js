import {

    getFirestore,

    collection,

    doc,

    getDoc,

    getDocs,

    setDoc,

    addDoc,

    updateDoc,

    deleteDoc,

    query,

    where,

    orderBy,

    limit

}

from "firebase/firestore";

import { app } from "./firebase.init.js";

export const db = getFirestore(app);

export {

    collection,

    doc,

    getDoc,

    getDocs,

    setDoc,

    addDoc,

    updateDoc,

    deleteDoc,

    query,

    where,

    orderBy,

    limit

};
