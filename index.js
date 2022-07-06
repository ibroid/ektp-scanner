import csv from "csvtojson";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const converter = csv({
    delimiter: "\t",
    ignoreEmpty: true,
})
console.log(__dirname)
const hasilPath = path.join(__dirname, '/bckp/');
function readFiles(dirname) {
    fs.readdir(dirname, function (err, files) {
        if (err) {
            console.log(err)
            return false;
        }

        if (files.length > 0) {

            files.forEach(file => {

                if (file.includes('.csv')) {

                    fs.readFile(hasilPath + file, "utf16le", (err, data) => {
                        if (err) {
                            console.log(err)
                        }
                        converter.fromString(data).then(res => console.log(res));
                    })
                }
            });
        }


    });
}

readFiles(hasilPath)




