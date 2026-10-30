/*
==================================================

COMPONENT REGISTRY

==================================================
*/


const components={};




export function register(

name,

component

){



components[name]=component;



}





export function getComponent(

name

){



return components[name];


}
