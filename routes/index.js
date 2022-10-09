const path = require('path');
const router = require('express').Router();

router.use(require(path.join(process.cwd(), 'routes', '/images.js')));
router.use(require(path.join(process.cwd(), 'routes', '/pages.js')));

module.exports = router;