import csv from "csvtojson";
import csv2json from "csvjson-csv2json"
import fs from "fs";
const csvFile = './hasil/2022-04-01-09-32-00-738.csv';

const converter = csv({
    delimiter: "\t",
    ignoreEmpty: true,
})
// converter.fromFile(csvFile).then(res => console.log(res));
converter.on('header', (header) => {
    console.log(header)
})
converter.preRawData((data) => {
    if (data.contains('/')) {
        return data.replace('/', '')
    }

    if (data.contains(' ')) {
        return data.replace(' ', '_')
    }
    return data;
});

fs.readFile(csvFile, "utf16le", (err, data) => {
    if (err) {
        console.log(err)
    }
    converter.fromString(data).then(res => console.log(res));
})


