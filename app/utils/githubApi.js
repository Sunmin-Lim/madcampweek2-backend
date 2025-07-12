//utilsgithubAPI
const axios = require('axios');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Helper to parse owner/repo from URL
function parseRepoUrl(url) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/);
  if (!match) throw new Error('Invalid GitHub URL format');
  return [match[1], match[2]];
}

// Get repo metadata
async function fetchRepoInfo(repoUrl) {
  const [owner, repo] = parseRepoUrl(repoUrl);
  const res = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}` }
  });
  return res.data;
}

// Get repo README in raw text
async function fetchReadme(repoUrl) {
  const [owner, repo] = parseRepoUrl(repoUrl);
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3.raw'
        }
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error fetching README:', error.message);
    return null;
  }
}

module.exports = {
  fetchRepoInfo,
  fetchReadme
};
