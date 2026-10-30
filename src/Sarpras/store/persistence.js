export function saveState(
key,
value
){

localStorage.setItem(

key,

JSON.stringify(value)

);

}




export function loadState(key){

const data=

localStorage.getItem(key);


return data ?

JSON.parse(data)

:null;


}



export function removeState(key){

localStorage.removeItem(key);

}
