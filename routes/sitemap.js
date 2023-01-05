const builder = require('xmlbuilder');
const fs = require('fs');
const path = require('path');
const router = require('express').Router();

router.get('/', (req, res) => {
	let organizations = fs.readdirSync(path.join(process.cwd(), 'assets/organizations'))
		.filter(x => x.endsWith('.json'))
		.map(x => { return {
			href: `https://masons.photography/${x.split('.')[0].replace('_', '-')}/`,
			modified: fs.statSync(path.join(process.cwd(), 'assets/organizations', x)).mtime.toISOString()
		};});

	let events = fs.readdirSync(path.join(process.cwd(), 'assets/events'))
		.filter(x => x.endsWith('.json'))
		.map(x => JSON.parse(fs.readFileSync(path.join(process.cwd(), 'assets/events', x))))
		.filter(x => !x.href)
		.map(x => { return {
			href: `https://masons.photography/${x.organization.toLowerCase().replace(' ', '-')}/${x.name.toLowerCase().replace(' ', '-')}/`,
			modified: fs.statSync(path.join(process.cwd(), 'assets/events', `${x.name.toLowerCase().replace(' ', '_')}.json`)).mtime.toISOString()
		};});

	let pages = [{
		href: 'https://masons.photography/',
		modified: fs.statSync(path.join(process.cwd(), 'index.html')).mtime.toISOString()
	}].concat(organizations, events);

	let xml = builder.create('urlset', { version: '1.0', encoding: 'UTF-8' }, null, { noValidation: true })
		.attribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
		
	for (let { href, modified } of pages) {
		let url = xml.element('url');
		url.element('loc', href);
		url.element('lastmod', modified);
		url.element('priority', (1.0 - (((href.match(/\//g) || []).length - 3) * 0.2)).toFixed(1));
	}

	res.type('xml').status(200).send(xml.end({ pretty: true}));
});

module.exports = router;