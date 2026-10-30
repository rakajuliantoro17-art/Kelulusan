/*
==========================================================
Sarprasin 2.0
Dashboard Chart Module
File : src/components/charts/js/dashboardChart.js
Version : 1.0.0
==========================================================
*/

import {

    createChart,
    defaultOptions,
    palette

} from "./chartConfig.js";

/* ==========================================================
   Monthly Dashboard Activity
========================================================== */

export function renderDashboardActivityChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    return createChart(canvas, {

        type: "line",

        data: {

            labels: dataset.labels || [

                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "Mei",
                "Jun",
                "Jul"

            ],

            datasets: [{

                label: "Aktivitas",

                data: dataset.values || [

                    120,
                    145,
                    168,
                    180,
                    210,
                    225,
                    240

                ],

                borderColor: palette[0],

                backgroundColor: `${palette[0]}20`,

                fill: true,

                tension: 0.35

            }]

        },

        options: {

            ...defaultOptions("Aktivitas Dashboard"),

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

}

/* ==========================================================
   Asset Status
========================================================== */

export function renderAssetStatusChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    return createChart(canvas, {

        type: "doughnut",

        data: {

            labels: dataset.labels || [

                "Aktif",
                "Maintenance",
                "Dipinjam",
                "Rusak"

            ],

            datasets: [{

                data: dataset.values || [

                    2418,
                    64,
                    32,
                    26

                ],

                backgroundColor: [

                    palette[1],
                    palette[2],
                    palette[4],
                    palette[3]

                ],

                borderWidth: 2

            }]

        },

        options: defaultOptions("Status Aset")

    });

}

/* ==========================================================
   Monthly Maintenance
========================================================== */

export function renderMaintenanceChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    return createChart(canvas, {

        type: "bar",

        data: {

            labels: dataset.labels || [

                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "Mei",
                "Jun",
                "Jul"

            ],

            datasets: [{

                label: "Maintenance",

                data: dataset.values || [

                    12,
                    15,
                    18,
                    14,
                    22,
                    20,
                    16

                ],

                backgroundColor: palette[2]

            }]

        },

        options: {

            ...defaultOptions("Maintenance Bulanan"),

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

}

/* ==========================================================
   Asset Category
========================================================== */

export function renderCategoryChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    return createChart(canvas, {

        type: "polarArea",

        data: {

            labels: dataset.labels || [

                "Elektronik",
                "Meubel",
                "Laboratorium",
                "Olahraga",
                "Lainnya"

            ],

            datasets: [{

                data: dataset.values || [

                    540,
                    720,
                    310,
                    180,
                    96

                ],

                backgroundColor: palette

            }]

        },

        options: defaultOptions("Kategori Aset")

    });

}

/* ==========================================================
   Dashboard Summary
========================================================== */

export function renderDashboardCharts(config = {}) {

    if (config.activity) {

        renderDashboardActivityChart(

            config.activity.id,

            config.activity.data

        );

    }

    if (config.status) {

        renderAssetStatusChart(

            config.status.id,

            config.status.data

        );

    }

    if (config.maintenance) {

        renderMaintenanceChart(

            config.maintenance.id,

            config.maintenance.data

        );

    }

    if (config.category) {

        renderCategoryChart(

            config.category.id,

            config.category.data

        );

    }

}
