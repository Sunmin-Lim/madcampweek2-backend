// jest.config.js
module.exports = {
  testEnvironment: 'node',
  globalSetup: './tests/globalSetup.js',
  globalTeardown: './tests/globalTeardown.js',
  testTimeout: 60000, // Global test timeout (60 seconds)
  // Optional: Uncomment to detect unclosed handles if tests still hang
  // detectOpenHandles: true,
  // forceExit: true, // Use with caution, can mask real issues but ensures exit
};