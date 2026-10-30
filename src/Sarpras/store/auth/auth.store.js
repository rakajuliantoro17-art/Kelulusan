import {

authState

}

from "./auth.state.js";



export const authStore = {


setUser(user){


authState.user=user;

authState.authenticated=
!!user;

authState.verified=
user?.emailVerified || false;


},



logout(){


authState.user=null;

authState.authenticated=false;

authState.verified=false;


},



get(){

return authState;

}


};
