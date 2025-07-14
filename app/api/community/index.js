const express = require('express');
const router = express.Router();

router.use('/', require('./community.routes'));

module.exports = router;