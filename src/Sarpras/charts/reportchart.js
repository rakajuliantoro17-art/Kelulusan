/*
==========================================================
Sarprasin 2.0
Report Chart Module
File : src/components/charts/js/reportChart.js
Version : 1.0.0
==========================================================
*/

import {

    createChart,
    defaultOptions,
    palette

} from "./chartConfig.js";

/* ==========================================================
   Asset Summary
========================================================== */

export function renderAssetSummaryChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    return createChart(canvas, {

        type: "bar",

        data: {

            labels: dataset.labels || [

                "Baik",
                "Rusak Ringan",
                "Rusak Berat",
                "Maintenance"

            ],

            datasets: [

                {

                    label: "Jumlah Aset",

                    data: dataset.values || [

                        2180,
                        180,
                        55,
                        125

                    ],

                    backgroundColor: [

                        palette[1],
                        palette[2],
                        palette[3],
                        palette[4]

                    ]

                }

            ]

        },

        options: {

            ...defaultOptions("Ringkasan Kondisi Aset"),

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

export function renderCategoryReportChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    return createChart(canvas, {

        type: "pie",

        data: {

            labels: dataset.labels || [

                "Elektronik",
                "Meubel",
                "Laboratorium",
                "Olahraga",
                "Lainnya"

            ],

            datasets: [

                {

                    data: dataset.values || [

                        520,
                        780,
                        360,
                        210,
                        95

                    ],

                    backgroundColor: palette

                }

            ]

        },

        options: defaultOptions("Distribusi Kategori")

    });

}

/* ==========================================================
   Procurement Trend
========================================================== */

export function renderProcurementReportChart(canvasId, dataset = {}) {

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

            datasets: [

                {

                    label: "Pengadaan",

                    data: dataset.values || [

                        145,
                        210,
                        315,
                        402,
                        286

                    ],

                    borderColor: palette[0],

                    backgroundColor: `${palette[0]}20`,

                    fill: true,

                    tension: 0.35

                }

            ]

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
   Maintenance Summary
========================================================== */

export function renderMaintenanceReportChart(canvasId, dataset = {}) {

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

            datasets: [

                {

                    data: dataset.values || [

                        142,
                        21,
                        36,
                        9

                    ],

                    backgroundColor: [

                        palette[1],
                        palette[2],
                        palette[0],
                        palette[3]

                    ]

                }

            ]

        },

        options: defaultOptions("Ringkasan Maintenance")

    });

}

/* ==========================================================
   Asset Value
========================================================== */

export function renderAssetValueChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    return createChart(canvas, {

        type: "bar",

        data: {

            labels: dataset.labels || [

                "Gedung",
                "Elektronik",
                "Meubel",
                "Laboratorium"

            ],

            datasets: [

                {

                    label: "Nilai (Juta Rupiah)",

                    data: dataset.values || [

                        4200,
                        980,
                        640,
                        1350

                    ],

                    backgroundColor: palette[0]

                }

            ]

        },

        options: {

            ...defaultOptions("Nilai Aset"),

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

}

/* ==========================================================
   Render All Report Charts
========================================================== */

export function renderReportCharts(config = {}) {

    if (config.summary) {

        renderAssetSummaryChart(

            config.summary.id,

            config.summary.data

        );

    }

    if (config.category) {

        renderCategoryReportChart(

            config.category.id,

            config.category.data

        );

    }

    if (config.procurement) {

        renderProcurementReportChart(

            config.procurement.id,

            config.procurement.data

        );

    }

    if (config.maintenance) {

        renderMaintenanceReportChart(

            config.maintenance.id,

            config.maintenance.data

        );

    }

    if (config.value) {

        renderAssetValueChart(

            config.value.id,

            config.value.data

        );

    }

}
