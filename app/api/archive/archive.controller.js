// archive.controller.js
const archiveService = require('../../services/archive.service');

exports.createArchive = async (req, res) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ message: 'repoUrl is required' });
    }

    // Log the userId received from the authentication middleware
    console.log('DEBUG: req.user.userId in controller:', req.user.userId, 'Type:', typeof req.user.userId);

    const archive = await archiveService.createArchive(req.user.userId, repoUrl);
    res.status(201).json(archive);
  } catch (err) {
    console.error('[CREATE ARCHIVE ERROR]:', err.message);
    res.status(500).json({ message: 'Error creating archive', error: err.message });
  }
};

exports.getAllArchives = async (req, res) => {
  try {
    const archives = await archiveService.getAllArchives();
    res.status(200).json(archives);
  } catch (err) {
    console.error('[GET ALL ARCHIVES ERROR]:', err.message);
    res.status(500).json({ message: 'Error fetching archives', error: err.message });
  }
};

exports.getArchiveById = async (req, res) => {
  try {
    const archive = await archiveService.getArchiveById(req.params.id);
    if (!archive) {
      return res.status(404).json({ message: 'Archive not found' });
    }
    res.status(200).json(archive);
  } catch (err) {
    console.error('[GET ARCHIVE BY ID ERROR]:', err.message);
    res.status(500).json({ message: 'Error fetching archive', error: err.message });
  }
};