import {

userState

}

from "./user.state.js";



export const userStore={



setProfile(data){


userState.profile=data;

userState.role=data.role;

userState.permissions=
data.permissions || [];

userState.loaded=true;


},




get(){

return userState;

}



};
