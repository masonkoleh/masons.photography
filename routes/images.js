const crypto = require('crypto');
const exif = require('exif-reader');
const fs = require('fs');
const path = require('path');
const router = require('express').Router();
const sharp = require('sharp');

const image_height = 250;
const gen_sha1 = string => crypto.createHash('sha1')
	.update(string)
	.digest('hex');

router.get(/((IMG_\d+)\.(webp|jpg))/, async (req, res) => {
	const { 0: image, 1: file_name, 2: file_type } = req.params;
	if (!fs.existsSync(path.join(process.cwd(), 'assets/pictures', `${file_name}.jpg`)))
		return res.sendStatus(404);

	res.header('Cache-Control', 'max-age=31536000, no-cache');
	res.vary('ETag, Content-Encoding');
	let inm = req.headers['if-none-match'];

	const img = sharp(path.join(process.cwd(), 'assets/pictures', `${file_name}.jpg`));
	let metadata = await img.metadata();
	if (metadata.exif) {
		let modhash = gen_sha1(`${exif(metadata.exif).image.ModifyDate}`);
		res.header('ETag', modhash);
		if (inm && inm == modhash)
			return res.sendStatus(304);
		if (req.method.toLowerCase() == 'head')
			return res.end();
	}

	if (file_type == 'jpg')
		return res.status(200).sendFile(path.join(process.cwd(), 'assets/pictures', `${image}`));

	img.resize({ height: Math.abs(image_height) })
		.withMetadata()
		.webp({ quality: 75 }).toBuffer()
		.then(data => res.type(file_type).status(200).send(data));
});

module.exports = router;