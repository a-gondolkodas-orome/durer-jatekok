module.exports = {
  setupFilesAfterEnv: ['jest-extended/all'],
  testEnvironment: 'jsdom',
  clearMocks: true,
  restoreMocks: true,
  testMatch: [
    '**/src/**/*.spec.js'
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!lodash-es)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/vue_archive/'
  ]
};
