import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv'
import fetch, { fileFromSync, FormData } from "node-fetch"
import csvToJson from "convert-csv-to-json";
import { io } from "socket.io-client";
import chokidar from "chokidar";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const socket = io('https://socket.pa-jakartautara.go.id/visitor', {
	transports: ['websocket']
	, secure: true, reconnect: true, rejectUnauthorized: false
});

dotenv.config()

const tempPath = path.join(__dirname, process.env.TEMPORARY_DIR);
const uploadPath = path.join(__dirname, process.env.UPLOAD_DIR);

function uploadFile(file) {
	const body = new FormData();
	if (file.includes('.csv')) {

		const result = csvToJson.fieldDelimiter('\t').utf16leEncoding().getJsonFromCsv(file)
		const fileId = file.split('-')[7]

		body.append('file_id', fileId.split('.')[0]);
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
			const fileId = file.split('-')[7]
			body.append('file_id', fileId.split('_')[0])
			body.set('foto', fileFromSync(file))
		} else {
			const fileId = file.split('-')[7]
			body.append('file_id', fileId.split('.')[0])
			body.set('ktp', fileFromSync(file))
		}
	}


	fetch('http://visitor.pa-jakartautara.go.id/api', {
		method: "POST",
		body: body
	}).then(res => res.json()).then(res => {
		console.log(res)
		fs.renameSync(file, file.replace('tmp', 'uploads'), (err) => {
			if (err) {
				console.log(err)
			}
			console.log('moved')
		})
	})
}

socket.on("connect", () => {
	console.log('Watcher is connected to socket')
})

socket.on("connect_error", (err) => {
	console.log(err)
})


const watcher = chokidar.watch(tempPath, {
	ignored: /(^|[\/\\])\../,
	persistent: true,
	ignorePermissionErrors: false,
})

watcher.on('add', (path, stats) => {
	console.log('Hasil Scan Berhasil Tersimpan. File : ' + path)
	uploadFile(path)
}).on('error', error => log(`Watcher error: ${error}`))

console.log('Watcher Started')  