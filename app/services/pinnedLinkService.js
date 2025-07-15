const UserPinnedLink = require('../models/UserPinnedLink');

async function addPinnedLink(userId, name, url) {
  const link = new UserPinnedLink({ userId, name, url });
  return await link.save();
}

async function removePinnedLink(userId, url) {
  return await UserPinnedLink.deleteOne({ userId, url });
}

async function getPinnedLinks(userId) {
  return await UserPinnedLink.find({ userId });
}

module.exports = {
  addPinnedLink,
  removePinnedLink,
  getPinnedLinks,
};
