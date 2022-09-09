const table = {
    name: 'whatever',
    columns: [
        { name: 'whatever', type: 'String' },
        { name: 'Id', type: 'UInt8' },
    ],
};
const columnNames = [];
table.columns.forEach((column) => columnNames.push(column.name));
console.log(`INSERT INTO ${table.name} (${columnNames})`);
