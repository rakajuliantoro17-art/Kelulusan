export function buildCategoryChart(assets){

    const result={};

    assets.forEach(asset=>{

        const category=

        asset.category || "Lainnya";

        result[category]=(

            result[category] || 0

        )+1;

    });

    return result;

}

export function buildConditionChart(assets){

    const chart={};

    assets.forEach(asset=>{

        const condition=

        asset.condition || "unknown";

        chart[condition]=(

            chart[condition] || 0

        )+1;

    });

    return chart;

}
