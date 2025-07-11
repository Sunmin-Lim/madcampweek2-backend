// server.js

// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // For handling Cross-Origin Resource Sharing
const dotenv = require('dotenv'); // For loading environment variables from .env file

// Load environment variables from .env file
// This should be called as early as possible in your application.
dotenv.config();

// Create an Express application instance
const app = express();

// Define the port for the server, using an environment variable or defaulting to 3000
const PORT = process.env.PORT || 3000;

// ⭐️ [1] Middleware Setup
// Enable CORS for all origins. In production, you might want to restrict this
// to specific origins (e.g., your Flutter app's domain).
app.use(cors());

// Enable Express to parse JSON formatted request bodies
app.use(express.json());

// ⭐️ [2] MongoDB Connection
// Connect to MongoDB using the URI from environment variables.
// Fallback to a local URI if MONGO_URI is not set (useful for local development).
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mydatabase')
  .then(() => console.log('✅ MongoDB 연결 성공! (Connection successful)'))
  .catch(err => console.error('❌ MongoDB 연결 실패! (Connection failed):', err));

// ⭐️ [3] Import and Register API Routes
// These paths are examples. Adjust them based on your actual project structure.
// You will create these files as you build out your API.
// For example, './routes/auth.js' might handle user registration and login.
// './routes/users.js' might handle user-related data.
// './routes/products.js' might handle product data.

// Example routes (you'll uncomment/add these as you create them)
// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/users');
// const productRoutes = require('./routes/products');

// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/products', productRoutes);

// For now, let's include the session and terminal routes you had, assuming their paths
// are correct relative to this server.js file.
// If these are not yet fully implemented or causing issues, you can comment them out
// and add them back as you build out their respective functionalities.
const sessionRoutes = require('./app/api/session/session.routes');
const terminalRoutes = require('./app/api/terminal/terminal.routes');
// Assuming session.admin.routes is also part of your app structure
const sessionAdminRoutes = require('./app/api/session/session.admin.routes');

app.use('/api/session', sessionRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/session/admin', sessionAdminRoutes); // Example admin route

// ⭐️ [4] Basic Root Route (for testing if server is alive)
app.get('/', (req, res) => {
  res.send('Hello from the Node.js Backend!');
});

// Declare `server` variable outside the conditional block
let serverInstance;

// ⭐️ [5] Start the Server (Conditional for Testing)
// This checks if the script is being run directly (e.g., `node server.js`)
// vs. being imported as a module (e.g., by Jest for testing).
if (require.main === module) {
  serverInstance = app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });
} else {
  // If this file is required as a module (e.g., by Jest),
  // we don't start the server listening here. Supertest will manage
  // starting a temporary server for testing purposes.
  // `serverInstance` will remain `undefined` in this context.
}

// ⭐️ [6] Export the Express app and the server instance
// Exporting `app` allows Supertest to use it for API testing.
// Exporting `serverInstance` (if it was initialized) allows Jest's globalTeardown
// or individual test `afterAll` hooks to explicitly close the server if it was started.
// In a test environment where `require.main !== module`, `serverInstance` will be `undefined`,
// and your test `afterAll` should handle this gracefully (as we've configured it).
module.exports = { app, server: serverInstance };