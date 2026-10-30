/*
==========================================================
Sarprasin 2.0
AI Analytics Chart
File : src/components/charts/js/aiChart.js
Version : 1.0.0
==========================================================
*/

import {
    createChart
} from "./chartConfig.js";

export function renderAIChart(canvasId, dataset = {}) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return null;

    const labels = dataset.labels || [
        "Baik",
        "Perlu Perhatian",
        "Maintenance",
        "Risiko Tinggi"
    ];

    const values = dataset.values || [
        68,
        18,
        9,
        5
    ];

    return createChart(canvas, {

        type: "doughnut",

        data: {

            labels,

            datasets: [

                {

                    label: "AI Asset Health",

                    data: values,

                    borderWidth: 2,

                    hoverOffset: 10

                }

            ]

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

                    text: "AI Asset Health Distribution"

                }

            },

            cutout: "65%"

        }

    });

}

/* ==========================================================
   AI Confidence Chart
========================================================== */

export function renderConfidenceChart(canvasId, confidence = 92) {

    return renderAIChart(canvasId, {

        labels: [

            "Confidence",

            "Remaining"

        ],

        values: [

            confidence,

            100 - confidence

        ]

    });

}

/* ==========================================================
   AI Prediction Chart
========================================================== */

export function renderPredictionChart(canvasId, prediction = {}) {

    return renderAIChart(canvasId, {

        labels: prediction.labels || [

            "Normal",

            "Perlu Servis",

            "Ganti Baru"

        ],

        values: prediction.values || [

            76,

            18,

            6

        ]

    });

}
