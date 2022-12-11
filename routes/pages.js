const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const router = require('express').Router();

router.get('/', (req, res) => {
	let $ = cheerio.load(fs.readFileSync(path.join(process.cwd(), 'index.html')));

	let { images } = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'assets/main.json')));
	let organizations = fs.readdirSync(path.join(process.cwd(), 'assets/organizations'))
		.filter(file => file.endsWith('.json'))
		.map(x => JSON.parse(fs.readFileSync(path.join(process.cwd(), 'assets/organizations', x))));

	$('div.header').addClass('active');
	for (let { name } of organizations)
		$('div.meets:first').append(`<a href='https://masons.photography/${name.toLowerCase().replace(' ', '-')}'><span>${name}</span></a>`);

	for (let i = images.length - 1; i > 0; i--) {
		let rgn = Math.floor(Math.random() * (i + 1));
		[images[i], images[rgn]] = [images[rgn], images[i]]; // Swap Array Values at Indexes i and rng
	}

	/*
	images.map(filename => { return { href: `https://masons.photography/${filename}`, src: `https://masons.photography/${filename.replace('jpg', 'webp')}` } })
		.forEach((img, index) => {
			$('div#container ul').append(`<li><a href='${img.href}' target='_blank' title='Click for Full Quality'><img class='image' src='${img.src}' ${ index > 7 ? "loading='lazy'" : "" }></a></li>`);
		});
	*/
	res.status(200).send($.html());
});

router.get('/:organization', (req, res) => {
	if (!fs.existsSync(path.join(process.cwd(), 'assets/organizations', `${req.params.organization.replace('-', '_')}.json`)))
		return res.status(404).sendFile(path.join(process.cwd(), 'notfound.html'));

	let $ = cheerio.load(fs.readFileSync(path.join(process.cwd(), 'index.html')));
	let events = fs.readdirSync(path.join(process.cwd(), 'assets/events'))
		.filter(file => file.endsWith('.json'))
		.map(x => JSON.parse(fs.readFileSync(path.join(process.cwd(), 'assets/events', x))))
		.filter(x => x.organization.toLowerCase().replace(' ', '-') == req.params.organization) 
		.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

	for (let { name, images } of events) {
		$('div.meets:first').append(`<a ${ (name.toLowerCase().replace(' ', '-') == req.params.event) ? "class='active'" : "" } href='https://masons.photography/${req.params.organization}/${name.toLowerCase().replace(' ', '-')}'><span>${name}</span></a>`);
		images.map(filename => { return { href: `https://masons.photography/${filename}`, src: `https://masons.photography/${filename.replace('jpg', 'webp')}` } })
			.forEach((img, index) => {
				$('div#container ul').append(`<li><a href='${img.href}' target='_blank' title='Click for Full Quality'><img class='image' src='${img.src}' ${ index > 7 ? "loading='lazy'" : "" }></a></li>`);
			});
	}
	
	res.status(200).send($.html());
});

router.get('/:organization/:event', (req, res) => {
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
		else $('div.meets:first').append(`<a href='https://masons.photography/${req.params.organization}/${name.toLowerCase().replace(' ', '-')}'><span>${name}</span></a>`);

	$('div.header a').after(`<span class='description'>${location.name} &#183; <i class='date'>${date}</i></span>`);
	
	images.map(filename => { return { href: `https://masons.photography/${filename}`, src: `https://masons.photography/${filename.replace('jpg', 'webp')}` } })
		.forEach((img, index) => {
			$('div#container ul').append(`<li><a href='${img.href}' target='_blank' title='Click for Full Quality'><img class='image' src='${img.src}' ${ index > 7 ? "loading='lazy'" : "" }></a></li>`);
		});

	res.status(200).send($.html());
});

module.exports = router;