// ======================================================
// Dashboard Service
// Sarprasin v2.0
// ======================================================

import { getAssets } from "./asset.service.js";

/* ======================================================
   DASHBOARD EXECUTIVE
====================================================== */

export async function getExecutiveDashboard() {

    const assets = await getAssets();

    const summary = createSummary(assets);

    return {

        success: true,

        ...summary,

        assets

    };

}

/* ======================================================
   DASHBOARD USER
====================================================== */

export async function getUserDashboard() {

    const assets = await getAssets();

    const summary = createSummary(assets);

    return {

        success: true,

        ...summary

    };

}

/* ======================================================
   DASHBOARD PUBLIC
====================================================== */

export async function getPublicDashboard() {

    const assets = await getAssets();

    const summary = createSummary(assets);

    return {

        total: summary.total,

        baik: summary.baik,

        perbaikan: summary.perbaikan,

        rusak: summary.rusak,

        assetHealth: summary.assetHealth

    };

}

/* ======================================================
   SUMMARY
====================================================== */

function createSummary(assets) {

    let total = 0;

    let baik = 0;

    let perbaikan = 0;

    let rusak = 0;

    let totalNilai = 0;

    const ruangan = {};

    const sumberDana = {};

    const tahun = {};

    assets.forEach(asset => {

        total++;

        totalNilai += Number(asset.nilai || 0);

        switch (asset.kodeKondisi) {

            case "BAIK":
                baik++;
                break;

            case "PERBAIKAN":
                perbaikan++;
                break;

            case "RUSAK":
                rusak++;
                break;
        }

        ruangan[asset.kodeRuang] =
            (ruangan[asset.kodeRuang] || 0) + 1;

        sumberDana[asset.kodeSumber] =
            (sumberDana[asset.kodeSumber] || 0) + 1;

        tahun[asset.tahun] =
            (tahun[asset.tahun] || 0) + 1;

    });

    const assetHealth =
        total === 0
            ? 0
            : Math.round(
                (
                    (baik * 1) +
                    (perbaikan * 0.6) +
                    (rusak * 0.2)
                ) / total * 100
            );

    return {

        total,

        baik,

        perbaikan,

        rusak,

        totalNilai,

        assetHealth,

        ruangan,

        sumberDana,

        tahun

    };

}
