// app/api/domain/domain.routes.js
const express = require('express');
const router = express.Router();
const domainController = require('./domain.controller'); // Import the domain controller

// Run the built container
router.post('/run', domainController.runContainer);

module.exports = router;
