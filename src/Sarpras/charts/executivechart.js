/*
==========================================================
Sarprasin 2.0
Executive Dashboard Chart
File : src/components/charts/js/executiveChart.js
Version : 1.0.0
==========================================================
*/

import {

    createChart,
    defaultOptions,
    palette

} from "./chartConfig.js";

/* ==========================================================
   Asset Health Index
========================================================== */

export function renderAssetHealthChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    return createChart(canvas, {

        type: "doughnut",

        data: {

            labels: dataset.labels || [

                "Baik",
                "Maintenance",
                "Rusak Ringan",
                "Rusak Berat"

            ],

            datasets: [{

                data: dataset.values || [

                    2180,
                    210,
                    98,
                    52

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

        options: defaultOptions("Indeks Kondisi Aset")

    });

}

/* ==========================================================
   Procurement Trend
========================================================== */

export function renderProcurementTrendChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    return createChart(canvas, {

        type: "line",

        data: {

            labels: dataset.labels || [

                "2022",
                "2023",
                "2024",
                "2025",
                "2026"

            ],

            datasets: [{

                label: "Pengadaan",

                data: dataset.values || [

                    180,
                    245,
                    320,
                    410,
                    285

                ],

                borderColor: palette[0],

                backgroundColor: `${palette[0]}20`,

                fill: true,

                tension: 0.35

            }]

        },

        options: {

            ...defaultOptions("Tren Pengadaan"),

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

}

/* ==========================================================
   Budget Utilization
========================================================== */

export function renderBudgetChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    return createChart(canvas, {

        type: "bar",

        data: {

            labels: dataset.labels || [

                "Q1",
                "Q2",
                "Q3",
                "Q4"

            ],

            datasets: [

                {

                    label: "Anggaran",

                    data: dataset.budget || [

                        250,
                        300,
                        280,
                        350

                    ],

                    backgroundColor: palette[0]

                },

                {

                    label: "Realisasi",

                    data: dataset.actual || [

                        210,
                        280,
                        240,
                        320

                    ],

                    backgroundColor: palette[1]

                }

            ]

        },

        options: {

            ...defaultOptions("Realisasi Anggaran"),

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

}

/* ==========================================================
   Asset Distribution
========================================================== */

export function renderLocationChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    return createChart(canvas, {

        type: "bar",

        data: {

            labels: dataset.labels || [

                "Kelas",
                "Laboratorium",
                "Perpustakaan",
                "TU",
                "Ruang Guru"

            ],

            datasets: [{

                label: "Jumlah Aset",

                data: dataset.values || [

                    980,
                    410,
                    235,
                    120,
                    185

                ],

                backgroundColor: palette[4]

            }]

        },

        options: {

            ...defaultOptions("Distribusi Aset"),

            indexAxis: "y",

            scales: {

                x: {

                    beginAtZero: true

                }

            }

        }

    });

}

/* ==========================================================
   Executive Summary
========================================================== */

export function renderExecutiveCharts(config = {}) {

    if (config.health) {

        renderAssetHealthChart(

            config.health.id,

            config.health.data

        );

    }

    if (config.procurement) {

        renderProcurementTrendChart(

            config.procurement.id,

            config.procurement.data

        );

    }

    if (config.budget) {

        renderBudgetChart(

            config.budget.id,

            config.budget.data

        );

    }

    if (config.location) {

        renderLocationChart(

            config.location.id,

            config.location.data

        );

    }

}
