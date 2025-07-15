require('dotenv').config();
require('../app/db');

const { googleSearchAndSave } = require('../app/services/googlecrawler');

(async () => {
  try {
    const query = process.argv[2] || 'flutter tutorial';
    console.log(`🔍 Searching Google for: "${query}"`);

    await googleSearchAndSave(query);
    console.log('✅ Google search and save finished!');
  } catch (err) {
    console.error('❌ Error in test script:', err);
  } finally {
    process.exit(0);
  }
})();
