/*
====================================================

Firebase Initializer

====================================================
*/

import { initializeApp } from "firebase/app";

import { firebaseConfig } from "./firebase.config.js";

export const app = initializeApp(firebaseConfig);

console.info(
    "🔥 Firebase Connected",
    app.options.projectId
);
