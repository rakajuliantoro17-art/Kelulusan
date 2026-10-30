import {

assetState

}

from "./asset.state.js";



export const assetStore={



set(items){

assetState.items=items;

assetState.total=
items.length;

},



select(item){

assetState.selected=item;

},



setFilter(filter){

assetState.filter=filter;

},



clear(){

assetState.items=[];

}


};
