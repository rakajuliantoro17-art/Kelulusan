export function mapDashboard(data){

    return{

        totalAsset:data.totalAsset ?? 0,

        activeAsset:data.activeAsset ?? 0,

        damagedAsset:data.damagedAsset ?? 0,

        maintenance:data.maintenance ?? 0,

        room:data.room ?? 0,

        user:data.user ?? 0,

        updatedAt:data.updatedAt ?? null

    };

}
