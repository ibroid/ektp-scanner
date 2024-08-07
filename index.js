import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import csvToJson from "convert-csv-to-json";
import chokidar from "chokidar";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config()

const tempPath = path.join(__dirname, process.env.TEMPORARY_DIR);
const uploadPath = path.join(__dirname, process.env.UPLOAD_DIR);

let uploadQueue = [];

function uploadFile(body) {
	fetch(process.env.URL_API, {
		method: "POST",
		headers: {
			"Authorization": "Bearer " + process.env.TOKEN
		},
		body: body
	}).then(res => res.json()).then(res => {
		console.log(res.message)

	})
}


const watcher = chokidar.watch(tempPath, {
	ignored: 'readme.txt',
	persistent: true,
	ignorePermissionErrors: false,
})

watcher
	.on('add', (path, stats) => {
		// uploadQueue.push(path)
		// cekForUploads()
		if (path.includes('.csv')) {
			sendData(path)
		}

		if (!path.includes('.txt')) {
			fs.renameSync(path, path.replace('temp', 'uploads'))
		}
	})
	.on('error', error => log(`Watcher error: ${error}`))


console.log('Watcher Started')

const sendData = (path) => {
	const result = extractData(path)
	const body = new FormData();
	console.log(result)

	body.append('nik', result[0].NIK);
	body.append('nama', result[0].Nama);
	body.append('jenis_kelamin', result[0]['JenisKelamin']);
	body.append('alamat', `${result[0].Alamat} RT/RW ${result[0]['RT/RW']}`);
	body.append('kelurahan', result[0]['Kel/Desa']);
	body.append('kecamatan', result[0].Kecamatan);
	body.append('kota', result[0].Kota);
	body.append('provinsi', result[0].Provinsi);
	body.append('pekerjaan', result[0].Pekerjaan);
	body.append('tanggal_lahir', result[0].TglLahir);

	uploadFile(body)
}

function extractData(path) {
	return csvToJson.fieldDelimiter('\t').utf16leEncoding().getJsonFromCsv(path)
}