export default {
  setupFilesAfterEnv: ['jest-extended/all'],
  testEnvironment: 'jsdom',
  clearMocks: true,
  restoreMocks: true,
  testMatch: [
    '**/src/**/*.spec.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/vue_archive/'
  ]
};
