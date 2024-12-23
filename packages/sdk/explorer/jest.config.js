module.exports = {
  preset: 'ts-jest',
  testMatch: ['<rootDir>/src/**/?(*.)+(spec|test).ts?(x)'],
  setupFilesAfterEnv: ['@planq-network/dev-utils/lib/matchers', '<rootDir>/jestSetup.ts'],
  verbose: true,
}
