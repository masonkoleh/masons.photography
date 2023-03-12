const express = require('express');
const path = require('path');
const router = express.Router();

router.use(require(path.join(process.cwd(), 'routes', '/images.js')));
router.use(express.static(path.join(process.cwd(), 'assets', 'public')));
router.use('/sitemap.xml', require(path.join(process.cwd(), 'routes', '/sitemap.js')));
router.use(require(path.join(process.cwd(), 'routes', '/pages.js')));

module.exports = router;