export function calculateStatistics(data){

    const totalAsset = data.assets.length;

    const activeAsset =

        data.assets.filter(

            a=>a.status==="active"

        ).length;

    const damagedAsset =

        data.assets.filter(

            a=>a.status==="damaged"

        ).length;

    return{

        totalAsset,

        activeAsset,

        damagedAsset,

        room:data.rooms.length,

        maintenance:data.maintenance.length,

        user:data.users.length

    };

}
