const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


function diffArrays(oldArray, newArray) {
    const operations = [];
    
    const oldMap = new Map();
    const newMap = new Map();

    oldArray.map((item, index)=> {
        oldMap.set(item.id, {
            item,
            index
        });
    });

    newArray.map((item, index)=> {
        newMap.set(item.id, {
            item,
            index
        })
    });


    // Ye foreach ha del, upd or move
    oldArray.forEach((oldItem, oldIndex)=> {

        // Ye del
        const newData = newMap.get(oldItem.id);

        if(!newData){
            operations.push({
                type: "delete",
                id: oldItem.id,
                index: oldIndex 
            });

            return;
        }

        const newItem = newData.item;
        const newIndex = newData.index;

        // Ye ha update kay lie
        if(JSON.stringify(oldItem) !== JSON.stringify(newItem)){
            operations.push({
                type: "update",
                id: oldItem.id,
                oldValue: oldItem,
                newValue: newItem,
            })
        }

        // ye move
        if(oldIndex !== newIndex) {
            operations.push({
                type: 'update', 
                id: oldItem.id,
                from: oldIndex,
                to: newIndex
            });
        }
    });

    newArray.forEach((newItem, newIndex) => {

        if (!oldMap.has(newItem.id)) {

            operations.push({
                type: "insert",
                id: newItem.id,
                index: newIndex,
                value: newItem
            });
        }
    });
    return operations;
}

rl.question("Enter JSON: ", (input) => {

    const data = JSON.parse(input);

    const oldArray = data.old;
    const newArray = data.new;

    const result = diffArrays(oldArray, newArray);

    console.log(JSON.stringify(result, null, 2));

    rl.close();
});