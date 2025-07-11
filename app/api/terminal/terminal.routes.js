const express = require('express');
const router = express.Router();
const controller = require('./terminal.controller');

router.post('/execute', controller.executeCommand);
router.post('/git', controller.executeGitCommand);
router.post('/ssh-key', controller.addSSHKey);

module.exports = router;