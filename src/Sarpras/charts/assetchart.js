/*
==========================================================
Sarprasin 2.0
Asset Chart Module
File : src/components/charts/js/assetChart.js
Version : 1.0.0
==========================================================
*/

import { createChart } from "./chartConfig.js";

/* ==========================================================
   Asset by Category
========================================================== */

export function renderAssetCategoryChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    return createChart(canvas, {

        type: "doughnut",

        data: {

            labels: dataset.labels || [
                "Komputer",
                "Meja",
                "Kursi",
                "Elektronik",
                "Lainnya"
            ],

            datasets: [{
                label: "Jumlah Aset",
                data: dataset.values || [
                    420,
                    315,
                    860,
                    190,
                    120
                ],
                borderWidth: 2
            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    position: "bottom"
                },

                title: {
                    display: true,
                    text: "Aset Berdasarkan Kategori"
                }

            }

        }

    });

}

/* ==========================================================
   Asset by Condition
========================================================== */

export function renderAssetConditionChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    return createChart(canvas, {

        type: "pie",

        data: {

            labels: dataset.labels || [
                "Baik",
                "Rusak Ringan",
                "Rusak Berat",
                "Maintenance"
            ],

            datasets: [{
                label: "Kondisi",
                data: dataset.values || [
                    2180,
                    180,
                    65,
                    115
                ]
            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    position: "bottom"

                },

                title: {

                    display: true,

                    text: "Kondisi Aset"

                }

            }

        }

    });

}

/* ==========================================================
   Asset by Room
========================================================== */

export function renderAssetRoomChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    return createChart(canvas, {

        type: "bar",

        data: {

            labels: dataset.labels || [
                "Lab 1",
                "Lab 2",
                "Perpus",
                "TU",
                "R. Guru",
                "Kelas"
            ],

            datasets: [{

                label: "Jumlah Aset",

                data: dataset.values || [
                    180,
                    165,
                    210,
                    90,
                    140,
                    980
                ]

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            scales: {

                y: {

                    beginAtZero: true

                }

            },

            plugins: {

                legend: {

                    display: false

                },

                title: {

                    display: true,

                    text: "Distribusi Aset per Ruangan"

                }

            }

        }

    });

}

/* ==========================================================
   Asset Procurement Trend
========================================================== */

export function renderAssetTrendChart(canvasId, dataset = {}) {

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

                label: "Pengadaan Aset",

                data: dataset.values || [
                    140,
                    220,
                    315,
                    410,
                    280
                ],

                tension: 0.35,

                fill: false

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            scales: {

                y: {

                    beginAtZero: true

                }

            },

            plugins: {

                title: {

                    display: true,

                    text: "Tren Pengadaan Aset"

                }

            }

        }

    });

}
