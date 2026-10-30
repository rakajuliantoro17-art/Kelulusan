/*
==================================================

TABLE RENDERER

==================================================
*/


export function renderRows(

data,

columns

){



return data.map(

row=>{


return `

<tr>

${

columns.map(

column=>`

<td>

${

row[column.field]

}

</td>

`

)

.join("")

}

</tr>

`


}

)

.join("");



}
