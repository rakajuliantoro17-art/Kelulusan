import { assetService } from "../asset/asset.service.js";
import { roomService } from "../room/room.service.js";
import { maintenanceService } from "../maintenance/maintenance.service.js";
import { userService } from "../user/user.service.js";

export async function loadDashboardData(){

    const [

        assets,

        rooms,

        maintenance,

        users

    ] = await Promise.all([

        assetService.getAssets(),

        roomService.getRooms(),

        maintenanceService.getMaintenance(),

        userService.getUsers()

    ]);

    return{

        assets,

        rooms,

        maintenance,

        users

    };

}
