import {

authStore,
userStore,
appStore

}

from "./index.js";



export function resetStore(){


authStore.logout();


userStore.setProfile({

role:null,

permissions:[]

});


appStore.setLoading(false);


}
