const compression = require('compression');
const app = require('express')();
const helmet = require('helmet');
const http = require('http');
const path = require('path');
const prom_bundle = require('express-prom-bundle');

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

http.createServer(app).listen(process.env.PORT || 4000, () => console.log(`Running on port ${ process.env.PORT || 4000 }`));