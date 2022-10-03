const fs = require('fs');
const path = require('path');
const express = require('express');
const cheerio = require('cheerio');
const http = require('http');
const _ = require('lodash/string');
const sharp = require('sharp');
const crypto = require('crypto');
const exif = require('exif-reader');
const compression = require('compression');
const helmet = require('helmet');

const image_height = 250;
const gen_sha1 = string => crypto.createHash('sha1')
		.update(string)
		.digest('hex');

const app = express();
app.use(compression());
app.use(helmet());

app.get('/', (req, res) => {
	let $ = cheerio.load(fs.readFileSync(path.join(process.cwd(), 'index.html')));

	let { images } = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'assets/main.json')));
	let organizations = fs.readdirSync(path.join(process.cwd(), 'assets/organizations'))
		.filter(file => file.endsWith('.json'))
		.map(x => JSON.parse(fs.readFileSync(path.join(process.cwd(), 'assets/organizations', x))));

	$('div.header').addClass('active');
	for (let { name } of organizations)
		$('div.meets').append(`<a href='https://masons.photography/${name.toLowerCase().replace(' ', '-')}'><span>${name}</span></a>`);

	for (let i = images.length - 1; i > 0; i--) {
		let rgn = Math.floor(Math.random() * (i + 1));
		[images[i], images[rgn]] = [images[rgn], images[i]]; // Swap Array Values at Indexes i and rng
	}

	images.map(filename => { return { href: `https://masons.photography/${filename}`, src: `https://masons.photography/${filename.replace('jpg', 'webp')}` } })
		.forEach((img, index) => {
			$('div#container ul').append(`<li><a href='${img.href}' target='_blank' title='Click for Full Quality'><img class='image' src='${img.src}' ${ index > 7 ? "loading='lazy'" : "" }></a></li>`);
		});
		
	res.status(200).send($.html());
});

app.get(/((IMG_\d+)\.(webp|jpg))/, async (req, res) => {
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

app.get('/:organization', (req, res) => {
	if (!fs.existsSync(path.join(process.cwd(), 'assets/organizations', `${req.params.organization.replace('-', '_')}.json`)))
		return res.status(404).sendFile(path.join(process.cwd(), 'notfound.html'));

	let $ = cheerio.load(fs.readFileSync(path.join(process.cwd(), 'index.html')));

	let events = fs.readdirSync(path.join(process.cwd(), 'assets/events'))
		.filter(file => file.endsWith('.json'))
		.map(x => JSON.parse(fs.readFileSync(path.join(process.cwd(), 'assets/events', x))))
		.filter(x => x.organization.toLowerCase().replace(' ', '-') == req.params.organization) 
		.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

	for (let { name, images } of events) {
		$('div.meets').append(`<a ${ (name.toLowerCase().replace(' ', '-') == req.params.event) ? "class='active'" : "" } href='https://masons.photography/${req.params.organization}/${name.toLowerCase().replace(' ', '-')}'><span>${name}</span></a>`);
		images.map(filename => { return { href: `https://masons.photography/${filename}`, src: `https://masons.photography/${filename.replace('jpg', 'webp')}` } })
			.forEach((img, index) => {
				$('div#container ul').append(`<li><a href='${img.href}' target='_blank' title='Click for Full Quality'><img class='image' src='${img.src}' ${ index > 7 ? "loading='lazy'" : "" }></a></li>`);
			});
	}
	
	res.status(200).send($.html());
});

app.get('/:organization/:event', (req, res) => {
	if (!fs.existsSync(path.join(process.cwd(), 'assets/events', `${req.params.event.replace('-', '_')}.json`)))
		return res.status(404).sendFile(path.join(process.cwd(), 'notfound.html'));

	let $ = cheerio.load(fs.readFileSync(path.join(process.cwd(), 'index.html')));

	let { images, date, location, href } = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'assets/events', `${req.params.event.replace('-', '_')}.json`)));

	if (href) return res.redirect(href);
	let events = fs.readdirSync(path.join(process.cwd(), 'assets/events'))
		.filter(file => file.endsWith('.json'))
		.map(x => JSON.parse(fs.readFileSync(path.join(process.cwd(), 'assets/events', x))))
		.filter(x => x.organization.toLowerCase().replace(' ', '-') == req.params.organization) 
		.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

	for (let { name } of events)
		if (name.toLowerCase().replace(' ', '-') == req.params.event) $('div.meets').append(`<a class='active' href='https://masons.photography/${req.params.organization}/${name.toLowerCase().replace(' ', '-')}'><span>${name}</span></a>`);
		else $('div.meets').append(`<a href='https://masons.photography/${req.params.organization}/${name.toLowerCase().replace(' ', '-')}'><span>${name}</span></a>`);

	$('div.header a').after(`<span class='description'>${location.name} &#183; <i class='date'>${date}</i></span>`);
	
	images.map(filename => { return { href: `https://masons.photography/${filename}`, src: `https://masons.photography/${filename.replace('jpg', 'webp')}` } })
		.forEach((img, index) => {
			$('div#container ul').append(`<li><a href='${img.href}' target='_blank' title='Click for Full Quality'><img class='image' src='${img.src}' ${ index > 7 ? "loading='lazy'" : "" }></a></li>`);
		});

	res.status(200).send($.html());
});

const httpserver = http.createServer(app).listen(4000, () => console.log(`Running on port 4000`));