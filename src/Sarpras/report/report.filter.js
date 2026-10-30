export function applyFilter(items,filter){

    return items.filter(item=>{

        return Object.entries(filter)

        .every(([key,value])=>{

            if(

                value===null ||

                value===undefined ||

                value===""

            ){

                return true;

            }

            return item[key]===value;

        });

    });

}
