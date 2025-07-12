// archive.service.js
const Archive = require('../models/Archive');
const githubApi = require('../utils/githubApi');
const mongoose = require('mongoose'); // Import mongoose to use ObjectId

exports.createArchive = async (userId, repoUrl) => {
  // Basic validation for userId to ensure it's a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.error('ERROR: Invalid userId provided to createArchive:', userId);
    throw new Error('Invalid user ID provided.');
  }

  const repoInfo = await githubApi.fetchRepoInfo(repoUrl);
  const readme = await githubApi.fetchReadme(repoUrl);

  const archive = new Archive({
    owner: userId, // userId should be a valid ObjectId
    repoUrl,
    repoName: repoInfo.name,
    description: repoInfo.description,
    readme,
    language: repoInfo.language,
    tags: repoInfo.topics,
  });

  console.log('DEBUG: Archive object before save in service:', JSON.stringify(archive, null, 2));

  await archive.save();

  // Perform populate and log the result
  const populatedArchive = await Archive.findById(archive._id).populate('owner', 'username email');
  console.log('DEBUG: Populated Archive object after query in service:', JSON.stringify(populatedArchive, null, 2));

  return populatedArchive;
};

exports.getAllArchives = () =>
  Archive.find().populate('owner', 'username email');

exports.getArchiveById = (id) =>
  Archive.findById(id).populate('owner', 'username email');
