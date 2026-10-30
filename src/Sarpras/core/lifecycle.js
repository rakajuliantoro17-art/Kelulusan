/*
==================================================

COMPONENT LIFECYCLE

==================================================
*/


export function mountComponents(){



const elements=

document.querySelectorAll(

"[data-component]"

);





elements.forEach(

async element=>{


const name=

element.dataset.component;




const html=

await fetch(

`/src/components/${name}.html`

)

.then(

r=>r.text()

);





element.innerHTML=html;



}


);



}
