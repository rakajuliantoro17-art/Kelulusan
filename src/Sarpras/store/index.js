/*
==================================================

SARPRASIN v2.0.4

GLOBAL STORE ENGINE

==================================================
*/


const stores={};


const listeners={};





export function createStore(

name,

initialState

){



stores[name]=initialState;


listeners[name]=[];



return stores[name];

}







export function getState(

name

){



return stores[name];


}







export function setState(

name,

value

){



stores[name]={


...stores[name],

...value


};




notify(name);



}







export function subscribe(

name,

callback

){



listeners[name].push(

callback

);



return ()=>{


listeners[name]=listeners[name]

.filter(

item=>item!==callback

);


};



}







function notify(

name

){



listeners[name]

.forEach(

callback=>

callback(

stores[name]

)

);


}







export function initializeStore(){



console.log(

"Global Store Ready"

);



}
