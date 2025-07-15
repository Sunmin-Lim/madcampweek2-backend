require('dotenv').config();
const axios = require('axios');
const { CommunityPost } = require('../models/Community');

const API_KEY = process.env.GOOGLE_API_KEY;
const CX = process.env.GOOGLE_CX;

async function googleSearchAndSave(query) {
  if (!API_KEY || !CX) {
    throw new Error('API_KEY or CX is missing in .env!');
  }

  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${API_KEY}&cx=${CX}&safe=active`;

  const { data } = await axios.get(url);

  if (!data.items || data.items.length === 0) {
    throw new Error('No results found from Google!');
  }

  for (const item of data.items) {
    await CommunityPost.create({
      title: item.title,
      content: item.snippet,
      tags: ['구글', query],
      answers: [{ text: item.link }],
      views: 0
    });
  }

  console.log(`✅ Saved ${data.items.length} items to CommunityPost`);
}

module.exports = { googleSearchAndSave };
