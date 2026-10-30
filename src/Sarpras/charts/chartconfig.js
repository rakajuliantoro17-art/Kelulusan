/*
==========================================================
Sarprasin 2.0
Chart Configuration
File : src/components/charts/js/chartConfig.js
Version : 1.0.0
==========================================================
*/

import {
    Chart,
    BarController,
    BarElement,
    LineController,
    LineElement,
    PieController,
    DoughnutController,
    RadarController,
    PolarAreaController,
    ScatterController,
    BubbleController,
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from "chart.js";

/* ==========================================================
   Register Chart.js Components
========================================================== */

Chart.register(

    BarController,
    BarElement,

    LineController,
    LineElement,

    PieController,
    DoughnutController,

    RadarController,
    PolarAreaController,

    ScatterController,
    BubbleController,

    CategoryScale,
    LinearScale,
    RadialLinearScale,

    PointElement,
    ArcElement,

    Title,
    Tooltip,
    Legend,
    Filler

);

/* ==========================================================
   Default Theme
========================================================== */

Chart.defaults.responsive = true;

Chart.defaults.maintainAspectRatio = false;

Chart.defaults.animation.duration = 800;

Chart.defaults.font.family =
    "'Inter', sans-serif";

Chart.defaults.font.size = 13;

Chart.defaults.plugins.legend.position = "bottom";

Chart.defaults.plugins.legend.labels.boxWidth = 14;

Chart.defaults.plugins.legend.labels.padding = 16;

Chart.defaults.plugins.tooltip.cornerRadius = 8;

Chart.defaults.plugins.tooltip.padding = 10;

/* ==========================================================
   Color Palette
========================================================== */

export const chartColors = {

    primary: "#2563EB",

    success: "#16A34A",

    warning: "#F59E0B",

    danger: "#DC2626",

    info: "#0891B2",

    secondary: "#64748B",

    purple: "#7C3AED",

    pink: "#DB2777",

    cyan: "#06B6D4",

    emerald: "#10B981"

};

export const palette = [

    chartColors.primary,
    chartColors.success,
    chartColors.warning,
    chartColors.danger,
    chartColors.info,
    chartColors.secondary,
    chartColors.purple,
    chartColors.pink,
    chartColors.cyan,
    chartColors.emerald

];

/* ==========================================================
   Default Dataset
========================================================== */

export function defaultDataset(data = []) {

    return {

        data,

        backgroundColor: palette,

        borderColor: palette,

        borderWidth: 2,

        hoverOffset: 8

    };

}

/* ==========================================================
   Create Chart
========================================================== */

export function createChart(canvas, config) {

    if (!canvas) return null;

    if (canvas.chartInstance) {

        canvas.chartInstance.destroy();

    }

    canvas.chartInstance = new Chart(

        canvas,

        config

    );

    return canvas.chartInstance;

}

/* ==========================================================
   Destroy Chart
========================================================== */

export function destroyChart(canvas) {

    if (!canvas) return;

    if (canvas.chartInstance) {

        canvas.chartInstance.destroy();

        canvas.chartInstance = null;

    }

}

/* ==========================================================
   Update Chart
========================================================== */

export function updateChart(chart, labels, values) {

    if (!chart) return;

    chart.data.labels = labels;

    chart.data.datasets[0].data = values;

    chart.update();

}

/* ==========================================================
   Common Options
========================================================== */

export function defaultOptions(title = "") {

    return {

        responsive: true,

        maintainAspectRatio: false,

        interaction: {

            mode: "index",

            intersect: false

        },

        plugins: {

            legend: {

                display: true,

                position: "bottom"

            },

            title: {

                display: !!title,

                text: title

            }

        }

    };

}
