import {

applyFilter

}

from "./report.filter.js";

import {

buildStatistics

}

from "./report.statistics.js";

export function buildReport(data,filter){

    const filtered=

    applyFilter(data,filter);

    return{

        items:filtered,

        statistics:

        buildStatistics(filtered),

        generatedAt:new Date()

    };

}
