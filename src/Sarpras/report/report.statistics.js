export function buildStatistics(data){

    return{

        total:data.length,

        active:data.filter(

            d=>d.status==="active"

        ).length,

        damaged:data.filter(

            d=>d.status==="damaged"

        ).length,

        maintenance:data.filter(

            d=>d.status==="maintenance"

        ).length

    };

}
