const path = require('path');
const router = require('express').Router();

router.use(require(path.join(process.cwd(), 'routes', '/images.js')));
router.use('/sitemap.xml', require(path.join(process.cwd(), 'routes', '/sitemap.js')));
router.use(require(path.join(process.cwd(), 'routes', '/pages.js')));

module.exports = router;