import {

reportState

}

from "./report.state.js";



export const reportStore={


set(data){

reportState.reports=data;

},



setPeriod(period){

reportState.period=period;

},



get(){

return reportState;

}


};
