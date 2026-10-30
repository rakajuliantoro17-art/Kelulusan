/*
==========================================================
Sarprasin 2.0
Maintenance Chart Module
File : src/components/charts/js/maintenanceChart.js
Version : 1.0.0
==========================================================
*/

import {

    createChart,
    defaultOptions,
    palette

} from "./chartConfig.js";

/* ==========================================================
   Monthly Maintenance Trend
========================================================== */

export function renderMaintenanceTrendChart(canvasId, dataset = {}) {

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
                "Jul",
                "Agu",
                "Sep",
                "Okt",
                "Nov",
                "Des"

            ],

            datasets: [{

                label: "Maintenance",

                data: dataset.values || [

                    18,
                    22,
                    20,
                    26,
                    30,
                    28,
                    24,
                    21,
                    19,
                    17,
                    20,
                    23

                ],

                borderColor: palette[2],

                backgroundColor: `${palette[2]}25`,

                fill: true,

                tension: 0.35

            }]

        },

        options: {

            ...defaultOptions("Tren Maintenance"),

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

}

/* ==========================================================
   Maintenance Status
========================================================== */

export function renderMaintenanceStatusChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    return createChart(canvas, {

        type: "doughnut",

        data: {

            labels: dataset.labels || [

                "Selesai",
                "Berjalan",
                "Terjadwal",
                "Tertunda"

            ],

            datasets: [{

                data: dataset.values || [

                    140,
                    26,
                    34,
                    8

                ],

                backgroundColor: [

                    palette[1],
                    palette[2],
                    palette[0],
                    palette[3]

                ]

            }]

        },

        options: defaultOptions("Status Maintenance")

    });

}

/* ==========================================================
   Maintenance Priority
========================================================== */

export function renderMaintenancePriorityChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    return createChart(canvas, {

        type: "bar",

        data: {

            labels: dataset.labels || [

                "Rendah",
                "Sedang",
                "Tinggi",
                "Darurat"

            ],

            datasets: [{

                label: "Jumlah Pekerjaan",

                data: dataset.values || [

                    38,
                    52,
                    26,
                    9

                ],

                backgroundColor: [

                    palette[1],
                    palette[0],
                    palette[2],
                    palette[3]

                ]

            }]

        },

        options: {

            ...defaultOptions("Prioritas Maintenance"),

            scales: {

                y: {

                    beginAtZero: true

                }

            },

            plugins: {

                legend: {

                    display: false

                }

            }

        }

    });

}

/* ==========================================================
   Maintenance by Asset Category
========================================================== */

export function renderMaintenanceCategoryChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    return createChart(canvas, {

        type: "polarArea",

        data: {

            labels: dataset.labels || [

                "Komputer",
                "AC",
                "Meubel",
                "Elektronik",
                "Jaringan"

            ],

            datasets: [{

                data: dataset.values || [

                    45,
                    18,
                    12,
                    21,
                    15

                ],

                backgroundColor: palette

            }]

        },

        options: defaultOptions("Maintenance per Kategori")

    });

}

/* ==========================================================
   Completion Rate
========================================================== */

export function renderCompletionChart(canvasId, completed = 92) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    return createChart(canvas, {

        type: "doughnut",

        data: {

            labels: [

                "Selesai",
                "Sisa"

            ],

            datasets: [{

                data: [

                    completed,
                    100 - completed

                ],

                backgroundColor: [

                    palette[1],
                    "#E5E7EB"

                ]

            }]

        },

        options: defaultOptions("Tingkat Penyelesaian")

    });

}

/* ==========================================================
   Render All Maintenance Charts
========================================================== */

export function renderMaintenanceCharts(config = {}) {

    if (config.trend) {

        renderMaintenanceTrendChart(

            config.trend.id,

            config.trend.data

        );

    }

    if (config.status) {

        renderMaintenanceStatusChart(

            config.status.id,

            config.status.data

        );

    }

    if (config.priority) {

        renderMaintenancePriorityChart(

            config.priority.id,

            config.priority.data

        );

    }

    if (config.category) {

        renderMaintenanceCategoryChart(

            config.category.id,

            config.category.data

        );

    }

    if (config.completion) {

        renderCompletionChart(

            config.completion.id,

            config.completion.value

        );

    }

}
