import {

loadDashboardData

}

from "./dashboard.repository.js";

import {

calculateStatistics

}

from "./dashboard.statistics.js";

import {

buildCategoryChart,

buildConditionChart

}

from "./dashboard.analytics.js";

import {

getDashboardCache,

setDashboardCache

}

from "./dashboard.cache.js";

export const dashboardService={

    async getDashboard(){

        const cached=

        getDashboardCache("dashboard");

        if(cached){

            return cached.value;

        }

        const raw=

        await loadDashboardData();

        const statistics=

        calculateStatistics(raw);

        const categoryChart=

        buildCategoryChart(raw.assets);

        const conditionChart=

        buildConditionChart(raw.assets);

        const dashboard={

            statistics,

            categoryChart,

            conditionChart,

            recentAssets:

            raw.assets

            .slice(0,10),

            updatedAt:

            new Date()

        };

        setDashboardCache(

            "dashboard",

            dashboard

        );

        return dashboard;

    },

    refresh(){

        return this.getDashboard();

    }

};
