module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!**/node_modules/**',
  ],
  coverageReporters: ['text', 'lcov'],
  verbose: true,
  testTimeout: 60000, // Increased timeout to 60 seconds
  setupFilesAfterEnv: ['./test/setup.js'] // Add setup file for global configurations
}; 