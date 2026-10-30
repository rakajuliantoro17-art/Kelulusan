import {

notificationState

}

from "./notification.state.js";



export const notificationStore={


add(item){


notificationState.items.unshift(item);


notificationState.unread++;


},



readAll(){

notificationState.unread=0;

},



get(){

return notificationState;

}


};
