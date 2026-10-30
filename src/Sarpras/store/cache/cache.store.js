import {

cacheState

}

from "./cache.state.js";



export const cacheStore={



set(key,value){


cacheState.data[key]=value;

cacheState.timestamp[key]=Date.now();


},



get(key){


return cacheState.data[key];

},



clear(){


cacheState.data={};

cacheState.timestamp={};


}



};
