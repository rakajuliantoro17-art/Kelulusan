export function mapRow(header,row){

    return Object.fromEntries(

        header.map(

            (key,index)=>

            [key,row[index]]

        )

    );

}
