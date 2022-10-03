const express = require('express');
const sharp = require('sharp');
const axios = require('axios');

const app = express();
app.get('/', (req, res) => {
	res.status(500).send('Improper API Usage.');
});

app.get('/:img', (req, res) => {
	const { img } = req.params;
	const { size = 0 } = req.query;

	axios({
		method: 'get',
		url: `https://masons.photography/${img}`,
		responseType: 'arraybuffer'
	}).then(result => {
		const img = sharp(result.data)
		img.metadata()
		.then(metadata => {
			return img.resize({ height: Math.abs(size) || metadata.height })
				.withMetadata()
				.webp({ quality: 65 }).toBuffer();
		}).then(data => res.type('jpeg').status(200).send(data));
	}).catch(console.error);
});

module.exports = app;
