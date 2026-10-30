import {

roomState

}

from "./room.state.js";



export const roomStore={


set(data){

roomState.rooms=data;

},


select(room){

roomState.selected=room;

}



};
