let modal=null;



export function openModal(

content

){


modal=document.getElementById(

"app-modal"

);



modal.querySelector(

".modal-content"

)

.innerHTML=content;



modal.style.display="block";


}





export function closeModal(){


modal.style.display="none";


}
