/*
==========================================================
Sarprasin 2.0
Realtime Chart Module
File : src/components/charts/js/realtimeChart.js
Version : 1.0.0
==========================================================
*/

import {

    createChart,
    defaultOptions,
    palette

} from "./chartConfig.js";

/* ==========================================================
   Internal Chart Registry
========================================================== */

const realtimeCharts = new Map();

/* ==========================================================
   Create Realtime Line Chart
========================================================== */

export function createRealtimeLineChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    const chart = createChart(canvas, {

        type: "line",

        data: {

            labels: dataset.labels || [],

            datasets: [

                {

                    label: dataset.label || "Realtime",

                    data: dataset.values || [],

                    borderColor: palette[0],

                    backgroundColor: `${palette[0]}20`,

                    fill: true,

                    tension: 0.35

                }

            ]

        },

        options: {

            ...defaultOptions(dataset.title || "Realtime Data"),

            animation: false,

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

    realtimeCharts.set(canvasId, chart);

    return chart;

}

/* ==========================================================
   Create Realtime Bar Chart
========================================================== */

export function createRealtimeBarChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    const chart = createChart(canvas, {

        type: "bar",

        data: {

            labels: dataset.labels || [],

            datasets: [

                {

                    label: dataset.label || "Realtime",

                    data: dataset.values || [],

                    backgroundColor: palette[1]

                }

            ]

        },

        options: {

            ...defaultOptions(dataset.title || "Realtime Statistics"),

            animation: false,

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

    realtimeCharts.set(canvasId, chart);

    return chart;

}

/* ==========================================================
   Create Realtime Doughnut Chart
========================================================== */

export function createRealtimeDoughnutChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    const chart = createChart(canvas, {

        type: "doughnut",

        data: {

            labels: dataset.labels || [],

            datasets: [

                {

                    data: dataset.values || [],

                    backgroundColor: palette

                }

            ]

        },

        options: {

            ...defaultOptions(dataset.title || "Realtime Distribution"),

            animation: false

        }

    });

    realtimeCharts.set(canvasId, chart);

    return chart;

}

/* ==========================================================
   Update Chart
========================================================== */

export function updateRealtimeChart(canvasId, labels = [], values = []) {

    const chart = realtimeCharts.get(canvasId);

    if (!chart) return;

    chart.data.labels = labels;

    chart.data.datasets[0].data = values;

    chart.update("none");

}

/* ==========================================================
   Replace Dataset
========================================================== */

export function replaceRealtimeDataset(canvasId, dataset) {

    const chart = realtimeCharts.get(canvasId);

    if (!chart) return;

    chart.data = dataset;

    chart.update("none");

}

/* ==========================================================
   Destroy Chart
========================================================== */

export function destroyRealtimeChart(canvasId) {

    const chart = realtimeCharts.get(canvasId);

    if (!chart) return;

    chart.destroy();

    realtimeCharts.delete(canvasId);

}

/* ==========================================================
   Destroy All Charts
========================================================== */

export function destroyAllRealtimeCharts() {

    realtimeCharts.forEach(chart => chart.destroy());

    realtimeCharts.clear();

}

/* ==========================================================
   Get Chart Instance
========================================================== */

export function getRealtimeChart(canvasId) {

    return realtimeCharts.get(canvasId) || null;

}
