const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const prometheus = require('prom-client');
const router = require('express').Router();

prometheus.collectDefaultMetrics();

// const http_req_ms = new prometheus.Histogram({
// 	name: 'http_request_duration_ms',
// 	help: 'Duration of HTTP requests in ms',
// 	labelNames: ['route'],
// 	buckets: [0.10, 5, 15, 50, 100, 200, 300, 400, 500]
// });
/*
router.use((req, res) => {
	res.locals.startEpoch = Date.now();
});
*/
router.get('/metrics', (req, res) => {
	//prometheus.register.metrics().then(str => console.log(str));
	res.set('Content-Type', prometheus.register.contentType);
	res.send(prometheus.register.metrics());
});

router.get('/', (req, res) => {
	//res.locals.startEpoch = Date.now();
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

	images.map(filename => { return { href: `https://masons.photography/${filename}`, src: `https://masons.photography/${filename.replace('jpg', 'webp')}` }; })
		.forEach((img, index) => {
			$('div#container ul').append(`<li><a href='${img.href}' target='_blank' title='Click for Full Quality'><img class='image' src='${img.src}' ${ index > 7 ? "loading='lazy'" : "" }></a></li>`);
		});
		
	res.status(200).send($.html());
	// const ms = Date.now() - res.locals.startEpoch;
	// http_req_ms.labels(req.method, req.route.path, res.statusCode)
	// 	.observe(ms);
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
		images.map(filename => { return { href: `https://masons.photography/${filename}`, src: `https://masons.photography/${filename.replace('jpg', 'webp')}` }; })
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
	
	images.map(filename => { return { href: `https://masons.photography/${filename}`, src: `https://masons.photography/${filename.replace('jpg', 'webp')}` }; })
	.forEach((img, index) => {
			$('div#container ul').append(`<li><a href='${img.href}' target='_blank' title='Click for Full Quality'><img class='image' src='${img.src}' ${ index > 7 ? "loading='lazy'" : "" }></a></li>`);
		});

	res.status(200).send($.html());
});
/*
router.use((req, res) => {
	const ms = Date.now() - res.locals.startEpoch;
	http_req_ms.labels(req.method, req.route.path, res.statusCode)
		.observe(ms);
});
*/
module.exports = router;