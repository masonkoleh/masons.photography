const compression = require('compression');
const express = require('express');
const helmet = require('helmet');
const http = require('http');
const path = require('path');

const app = express();
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

const httpserver = http.createServer(app).listen(process.env.PORT || 4000, () => console.log(`Running on port ${ process.env.PORT || 4000 }`));