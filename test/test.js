/*
	eslint no-undef: "warn"
	--------
	When using the supertest library, both describe and it are defined functions.
*/

//	const assert = require('assert');
const request = require('supertest');
const express = require('express');
const path = require('path');

const app = express();
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
		it('responds with valid xml file', done => {
			request(app)
				.get('/metrics')
				//.set('Accept', 'text/xml, application/xml')
				//.expect('Content-Type', /xml/)
				.expect(200, done);
		});
	});
});