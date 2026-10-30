/*
==================================================

TABLE ENGINE

==================================================
*/


import {

defaultTableConfig

}

from "./table.config.js";





export class TableEngine{


constructor(

element,

config={}

){


this.element=

element;


this.config={

...defaultTableConfig,

...config

};


this.data=[];


this.filtered=[];


}







setData(

data

){



this.data=data;


this.filtered=data;


this.render();


}







search(

keyword

){



this.filtered=

this.data.filter(

item=>

JSON.stringify(item)

.toLowerCase()

.includes(

keyword.toLowerCase()

)

);



this.render();



}







render(){



this.element.innerHTML=

this.createTable();



}







createTable(){



if(

this.filtered.length===0

)

return this.empty();



return `

<table class="app-table">

<tbody>

${

this.filtered

.map(

row=>

`

<tr>

${

Object.values(row)

.map(

value=>

`

<td>${value}</td>

`

)

.join("")

}

</tr>

`

)

.join("")

}

</tbody>

</table>

`;

}



empty(){


return `

<div class="table-empty">

Tidak ada data

</div>

`;

}


}
