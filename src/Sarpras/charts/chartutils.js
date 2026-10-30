/*
==========================================================
Sarprasin 2.0
Chart Utilities
File : src/components/charts/js/chartUtils.js
Version : 1.0.0
==========================================================
*/

import { chartColors } from "./chartConfig.js";

/* ==========================================================
   Number Formatter
========================================================== */

export function formatNumber(value = 0) {

    return new Intl.NumberFormat("id-ID").format(value);

}

/* ==========================================================
   Currency Formatter
========================================================== */

export function formatCurrency(value = 0) {

    return new Intl.NumberFormat("id-ID", {

        style: "currency",

        currency: "IDR",

        maximumFractionDigits: 0

    }).format(value);

}

/* ==========================================================
   Percentage
========================================================== */

export function formatPercent(value = 0, digits = 1) {

    return `${Number(value).toFixed(digits)}%`;

}

/* ==========================================================
   Safe Percentage
========================================================== */

export function calculatePercent(part = 0, total = 0) {

    if (total === 0) return 0;

    return (part / total) * 100;

}

/* ==========================================================
   Sum Array
========================================================== */

export function sum(values = []) {

    return values.reduce((total, value) => total + Number(value), 0);

}

/* ==========================================================
   Average
========================================================== */

export function average(values = []) {

    if (!values.length) return 0;

    return sum(values) / values.length;

}

/* ==========================================================
   Maximum
========================================================== */

export function max(values = []) {

    return Math.max(...values);

}

/* ==========================================================
   Minimum
========================================================== */

export function min(values = []) {

    return Math.min(...values);

}

/* ==========================================================
   Asset Condition Color
========================================================== */

export function getConditionColor(condition = "") {

    switch (condition.toLowerCase()) {

        case "baik":
            return chartColors.success;

        case "rusak ringan":
            return chartColors.warning;

        case "rusak berat":
            return chartColors.danger;

        case "maintenance":
            return chartColors.info;

        default:
            return chartColors.secondary;

    }

}

/* ==========================================================
   Status Color
========================================================== */

export function getStatusColor(status = "") {

    switch (status.toLowerCase()) {

        case "aktif":
            return chartColors.success;

        case "dipinjam":
            return chartColors.warning;

        case "maintenance":
            return chartColors.info;

        case "nonaktif":
            return chartColors.secondary;

        case "rusak":
            return chartColors.danger;

        default:
            return chartColors.primary;

    }

}

/* ==========================================================
   Build Dataset
========================================================== */

export function buildDataset(label, values, colors) {

    return {

        label,

        data: values,

        backgroundColor: colors,

        borderColor: colors,

        borderWidth: 2

    };

}

/* ==========================================================
   Extract Labels
========================================================== */

export function extractLabels(data = [], key = "label") {

    return data.map(item => item[key]);

}

/* ==========================================================
   Extract Values
========================================================== */

export function extractValues(data = [], key = "value") {

    return data.map(item => Number(item[key]));

}

/* ==========================================================
   Sort Descending
========================================================== */

export function sortDescending(data = [], key = "value") {

    return [...data].sort((a, b) => b[key] - a[key]);

}

/* ==========================================================
   Top N
========================================================== */

export function topItems(data = [], limit = 5) {

    return sortDescending(data).slice(0, limit);

}

/* ==========================================================
   Group By
========================================================== */

export function groupBy(data = [], field) {

    return data.reduce((groups, item) => {

        const key = item[field];

        groups[key] ??= [];

        groups[key].push(item);

        return groups;

    }, {});

}

/* ==========================================================
   Month Labels
========================================================== */

export function monthLabels() {

    return [

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

    ];

}

/* ==========================================================
   Year Labels
========================================================== */

export function yearLabels(start, end) {

    const years = [];

    for (let year = start; year <= end; year++) {

        years.push(String(year));

    }

    return years;

}
