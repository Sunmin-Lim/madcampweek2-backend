//archiveroutes
const express = require('express');
const router = express.Router();
const controller = require('./archive.controller');
const authenticateToken = require('../../middleware/authMiddleware');

// Upload new archive (requires login)
router.post('/', authenticateToken, controller.createArchive);

// Get all archives (public)
router.get('/', controller.getAllArchives);

// Get single archive by ID
router.get('/:id', controller.getArchiveById);

module.exports = router;
