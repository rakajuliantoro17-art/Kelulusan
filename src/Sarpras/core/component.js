/*
==================================================

SARPRASIN v2.0.5

COMPONENT BASE

==================================================
*/


export class Component{


constructor(

name,

template

){


this.name=name;


this.template=template;


}




mount(

target,

data={}

){



const element=

document.querySelector(

target

);



if(!element)

return;



element.innerHTML=

this.render(data);



this.onMount();


}






render(

data

){



return this.template;


}





onMount(){



}



destroy(){



}



}
