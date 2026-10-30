import {

loadAssetReport

}

from "./report.repository.js";

import {

buildReport

}

from "./report.builder.js";

import {

getReportCache,

setReportCache

}

from "./report.cache.js";

import {

exportPDF,

exportExcel,

exportCSV

}

from "./report.export.js";

export const reportService={

    async asset(filter={}){

        const key=

        JSON.stringify(filter);

        const cached=

        getReportCache(key);

        if(cached){

            return cached.value;

        }

        const data=

        await loadAssetReport();

        const report=

        buildReport(

            data,

            filter

        );

        setReportCache(

            key,

            report

        );

        return report;

    },

    async export(report,format){

        switch(format){

            case "pdf":

                return exportPDF(report);

            case "xlsx":

                return exportExcel(report);

            case "csv":

                return exportCSV(report);

            default:

                throw new Error(

                    "Format ekspor tidak didukung."

                );

        }

    }

};
