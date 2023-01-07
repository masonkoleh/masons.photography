/*
	eslint no-undef: "warn"
	--------
	When using the supertest library, both describe and it are defined functions.
*/

//	const assert = require('assert');

const app = require('express')();
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');
const prom_bundle = require('express-prom-bundle');
const request = require('supertest');

app.use(prom_bundle({
	includeMethod: true,
	includePath: true,
	includeStatusCode: true,
	includeUp: true,
	customLabels: { project_name: 'masons.photography', project_type: 'website' },
	promClient: { collectDefaultMetrics: {} }
}));

app.use(compression());
app.use(helmet({
	contentSecurityPolicy: (process.env.NODE_ENV == 'production') ? {
		directives: {
			defaultSrc: ['*'],
			imgSrc: ["'self'", '*', 'https:', 'data:', 'blob:'],
			scriptSrc: ["'self'", "*", "data:", "'unsafe-eval'", "'unsafe-inline'", "blob:"],
			mediaSrc: ["'self'", "*", 'https:', 'data:', 'blob:']
		}
	} : false,
	crossOriginResourcePolicy: (process.env.NODE_ENV == 'production') ? undefined : false,
	crossOriginEmbedderPolicy: (process.env.NODE_ENV == 'production') ? undefined : false
}));

app.use(require(path.join(process.cwd(), 'routes')));

// describe('', () => {});
describe('Image CDN', () => {
	describe('GET /*.jpg', () => {
		describe('valid file', () => {
			it('responds with *.jpg', done => {
				request(app)
					.get('/IMG_6274.jpg')
					.set('Accept', 'image/jpeg')
					.expect('Content-Type', /jpe?g/)
					.expect(200, done);
			});
		});

		describe('non-existant file', () => {
			it('responds with 404 not found', done => {
				request(app)
					.get('/IMG_0000.jpg')
					.set('Accept', 'image/jpeg')
					.expect('Content-Type', /plain/)
					.expect(404, done);
			});
		});

		describe('uppercase extension', () => {
			it('responds with 404 not found', done => {
				request(app)
					.get('/IMG_6274.JPG')
					.set('Accept', 'image/jpeg')
					.expect('Content-Type', /html/)
					.expect(404, done);
			});
		});
	});

	describe('GET /*.webp', () => {
		describe('valid file', () => {
			it('responds with *.webp', done => {
				request(app)
					.get('/IMG_6274.webp')
					.set('Accept', 'image/webp')
					.expect('Content-Type', /webp/)
					.expect(200, done);
			});
		});
	});
});

describe('GET /sitemap.xml', () => {
	it('responds with valid xml file', done => {
		request(app)
			.get('/sitemap.xml')
			.set('Accept', 'text/xml, application/xml')
			.expect('Content-Type', /xml/)
			.expect(200, done);
	});
});

describe('Metrics Endpoint', () => {
	describe('GET /metrics', () => {
		it('responds with valid text file', done => {
			request(app)
				.get('/metrics')
				.set('Accept', 'text/plain, text/html, application/json')
				.expect('Content-Type', /plain/)
				.expect(200, done);
		});
	});
});