import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv'
import fetch, { fileFromSync, FormData } from "node-fetch"
import csvToJson from "convert-csv-to-json";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import chokidar from "chokidar";

dotenv.config()

const tempPath = path.join(__dirname, process.env.TEMPORARY_DIR);
const uploadPath = path.join(__dirname, process.env.UPLOAD_DIR);

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

					const result = csvToJson.fieldDelimiter('\t').utf16leEncoding().getJsonFromCsv(tempPath + file)

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
						body.set('foto', fileFromSync(tempPath + file))
					} else {

						body.set('ktp', fileFromSync(tempPath + file))
					}
				}

			});

			const requestUpload = await

				console.log(requestUpload)

			files.forEach(file => {
				fs.renameSync(tempPath + file, uploadPath + file, (err) => {
					if (err) {
						console.log(err)
					}
					console.log('moved')
				})
			})

		}
	});
}

// readFiles(tempPath)

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


	fetch('http://visitor.pa-jakartautara.go.id/debug', {
		method: "POST",
		body: body
	}).then(res => res.json()).then(res => {
		console.log(res)
		fs.renameSync(file, file.replace('temp', 'uploads'), (err) => {
			if (err) {
				console.log(err)
			}
			console.log('moved')
		})
	})
}

const watcher = chokidar.watch(tempPath, {
	ignored: /(^|[\/\\])\../,
	persistent: true
})

watcher.on('add', (path, stats) => {
	// console.log(path.split('-')[7])
	// console.log(stats)
	uploadFile(path)
})

