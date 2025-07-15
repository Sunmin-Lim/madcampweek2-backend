require('dotenv').config();
const axios = require('axios');
const { CommunityPost } = require('../models/Community');

const API_KEY = process.env.GOOGLE_API_KEY;
const CX = process.env.GOOGLE_CX;

async function googleSearchAndSave(query) {
  if (!API_KEY || !CX) {
    throw new Error('❌ GOOGLE_API_KEY or GOOGLE_CX is missing in .env!');
  }

  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${API_KEY}&cx=${CX}&safe=active`;

  console.log('🌐 Sending request to:', url);

  try {
    const { data } = await axios.get(url);

    if (!data.items || data.items.length === 0) {
      console.warn('⚠️ No results found from Google!');
      return;
    }

    const bulkPosts = data.items.map(item => ({
      title: item.title,
      content: item.snippet,
      tags: ['구글', query],
      answers: [{ text: item.link }],
      views: 0
    }));

    await CommunityPost.insertMany(bulkPosts);
    console.log(`✅ Saved ${bulkPosts.length} items to CommunityPost`);
  } catch (error) {
    console.error('❌ Error in googleSearchAndSave:', error.message);
    throw error;
  }
}

module.exports = { googleSearchAndSave };
