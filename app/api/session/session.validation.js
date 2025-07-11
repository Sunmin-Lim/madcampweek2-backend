function validateBuildRun(req, res, next) {
  const { user_id, localPath, imageName } = req.body;
  if (!user_id || !localPath || !imageName) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  next();
}

module.exports = {
  validateBuildRun
};
