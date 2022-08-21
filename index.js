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

let uploadQueue = [];

function uploadFile(body, file) {
	fetch(process.env.URL_API, {
		method: "POST",
		body: body
	}).then(res => res.json()).then(res => {
		console.log(res.message)
		socket.emit('client_uploaded', (!res.filename) ? res.data : res.filename)
		fs.renameSync(file, file.replace('temp', 'uploads'))
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

watcher
	.on('add', (path, stats) => {
		uploadQueue.push(path)
		cekForUploads()
	})
	.on('error', error => log(`Watcher error: ${error}`))


console.log('Watcher Started')

const cekForUploads = () => {
	if (uploadQueue.length == 3) {
		uploadQueue.forEach((item, index) => {
			if (item.includes('.csv')) {
				uploadQueue.splice(index, 1)
				uploadQueue.unshift(item)
			}
		})
		if (uploadQueue[0].includes('.csv')) {
			const file = uploadQueue[0];
			const body = new FormData();
			const result = csvToJson.fieldDelimiter('\t').utf16leEncoding().getJsonFromCsv(file)
			const fileId = file.split('-')[7]
			console.log(result)

			body.append('file_id', fileId.split('.')[0]);
			body.append('nik', result[0].NIK);
			body.append('nama', result[0].Nama);
			body.append('jenis_kelamin', result[0]['JenisKelamin']);
			body.append('alamat', `${result[0].Alamat} RT/RW ${result[0]['RT/RW']}`);
			body.append('kelurahan', result[0]['Kel/Desa']);
			body.append('kecamatan', result[0].Kecamatan);
			body.append('kota', result[0].Kota);
			body.append('provinsi', result[0].Provinsi);
			body.append('pekerjaan', result[0].Pekerjaan);

			uploadQueue.forEach((item, index) => {
				if (item.includes('.jpg')) {
					if (item.includes('_Photo')) {
						const fileId = item.split('-')[7]
						body.append('file_id', fileId.split('_')[0])
						body.set('foto', fileFromSync(item))
					} else {
						const fileId = item.split('-')[7]
						body.append('file_id', fileId.split('.')[0])
						body.set('ktp', fileFromSync(item))
					}
				}
				uploadFile(body, item)
			})

		}
		uploadQueue = [];
	}

}