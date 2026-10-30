import {

maintenanceState

}

from "./maintenance.state.js";



export const maintenanceStore={


set(data){

maintenanceState.records=data;

},



setActive(value){

maintenanceState.active=value;

},



select(data){

maintenanceState.selected=data;

}


};
