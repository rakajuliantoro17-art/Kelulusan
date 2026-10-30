import {

    getAnalytics,

    isSupported,

    logEvent

}

from "firebase/analytics";

import { app } from "./firebase.init.js";

let analytics = null;

export async function initializeAnalytics() {

    if (await isSupported()) {

        analytics = getAnalytics(app);

        console.info("Analytics Ready");

    }

    return analytics;

}

export const EVENTS = {

    CREATE_ASSET: "create_asset",
    UPDATE_ASSET: "update_asset",
    DELETE_ASSET: "delete_asset",
    LOGIN: "login",
    LOGOUT: "logout"

};

export function trackEvent(eventName, params = {}) {

    if (!analytics) return;

    logEvent(analytics, eventName, params);

}
