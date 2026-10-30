// ======================================================
// Report Service
// Sarprasin v2.0
// ======================================================

import { getAssets } from "./asset.service.js";

/* ======================================================
   INVENTORY REPORT
====================================================== */

export async function getInventoryReport() {

    const assets = await getAssets();

    return {

        generatedAt: new Date().toISOString(),

        totalAsset: assets.length,

        data: assets

    };

}

/* ======================================================
   ROOM REPORT
====================================================== */

export async function getRoomReport(kodeRuang) {

    const assets = await getAssets();

    const result = assets.filter(asset =>
        asset.kodeRuang === kodeRuang
    );

    return {

        generatedAt: new Date().toISOString(),

        kodeRuang,

        total: result.length,

        data: result

    };

}

/* ======================================================
   FINANCIAL REPORT
====================================================== */

export async function getFinancialReport() {

    const assets = await getAssets();

    let totalNilai = 0;

    assets.forEach(asset => {

        totalNilai += Number(asset.nilai || 0);

    });

    return {

        generatedAt: new Date().toISOString(),

        totalAsset: assets.length,

        totalNilai,

        data: assets

    };

}

/* ======================================================
   EXECUTIVE REPORT
====================================================== */

export async function getExecutiveReport() {

    const assets = await getAssets();

    const report = {

        generatedAt: new Date().toISOString(),

        totalAsset: assets.length,

        totalNilai: 0,

        kondisi: {

            baik:0,

            perbaikan:0,

            rusak:0

        }

    };

    assets.forEach(asset=>{

        report.totalNilai += Number(asset.nilai || 0);

        switch(asset.kodeKondisi){

            case "BAIK":

                report.kondisi.baik++;

                break;

            case "PERBAIKAN":

                report.kondisi.perbaikan++;

                break;

            case "RUSAK":

                report.kondisi.rusak++;

                break;

        }

    });

    return report;

}
