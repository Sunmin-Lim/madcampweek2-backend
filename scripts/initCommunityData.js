require('dotenv').config();
const mongoose = require('mongoose');
const UsefulLink = require('../app/models/UsefulLink');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    await UsefulLink.deleteMany({});
    await UsefulLink.insertMany([
      { name: 'Flutter Docs', url: 'https://flutter.dev' },
      { name: 'GitHub', url: 'https://github.com' },
      { name: 'StackOverflow', url: 'https://stackoverflow.com' },
    ]);

    console.log('✅ Useful links seeded!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
