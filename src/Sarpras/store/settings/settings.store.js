import {

settingsState

}

from "./settings.state.js";



export const settingsStore={



setTheme(value){

settingsState.theme=value;

},



toggleCompact(){

settingsState.compact =
!settingsState.compact;

},



get(){

return settingsState;

}


};
