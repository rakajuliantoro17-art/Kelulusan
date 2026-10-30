import {

appState

}

from "./app.state.js";



export const appStore = {



get(){

return appState;

},



setLoading(value){

appState.loading=value;

},



setOnline(value){

appState.online=value;

},



setMaintenance(value){

appState.maintenance=value;

},



toggleSidebar(){

appState.sidebar =
!appState.sidebar;

}



};
