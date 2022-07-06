import csv from "csvtojson";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv'
import fetch, { fileFromSync, FormData } from "node-fetch"
import csvToJson from "convert-csv-to-json";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const converter = csv({
	delimiter: "\t",
	ignoreEmpty: true,
})
dotenv.config()

const hasilPath = path.join(__dirname, process.env.RESULT_DIR);

function readFiles(dirname) {
	fs.readdir(dirname, async function (err, files) {
		if (err) {
			console.log(err)
			return false;
		}

		if (files.length > 0) {

			const body = new FormData();
			files.forEach((file) => {

				if (file.includes('.csv')) {

					const result = csvToJson.fieldDelimiter('\t').utf16leEncoding().getJsonFromCsv(hasilPath + file)

					body.append('nik', result[0].NIK);
					body.append('nama', result[0].Nama);
					body.append('jenis_kelamin', result[0]['Jenis Kelamin']);
					body.append('alamat', `${result[0].Alamat} RT/RW ${result[0]['RT/RW']}`);
					body.append('kelurahan', result[0]['Kel/Desa']);
					body.append('kecamatan', result[0].Kecamatan);
					body.append('kota', result[0].Kota);
					body.append('provinsi', result[0].Provinsi);
					body.append('Pekerjaan', result[0].Pekerjaan);

				}

				if (file.includes('.jpg')) {
					if (file.includes('_Photo')) {
						body.set('foto', fileFromSync(hasilPath + file))
					} else {

						body.set('ktp', fileFromSync(hasilPath + file))
					}
				}

			});

			const requestUpload = await fetch('http://visitor.pa-jakartautara.go.id/debug', {
				method: "POST",
				body: body
			}).then(res => res.json())

			console.log(requestUpload)
		}


	});
}

readFiles(hasilPath)




