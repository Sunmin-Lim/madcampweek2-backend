const express = require('express');
const router = express.Router();
const sudo_archiveController = require('./sudo_archive.controller');

// Route to get the current user
router.get('/current-user', sudo_archiveController.getCurrentUser);

// Route to change the current user
router.post('/change-user', sudo_archiveController.changeCurrentUser);

// Route to add a user
router.post('/add', sudo_archiveController.addUser);

// Route to delete a user
router.post('/delete', sudo_archiveController.delUser);

// Route to push changes to the archive
router.post('/push', sudo_archiveController.pushToArchive);

module.exports = router;
