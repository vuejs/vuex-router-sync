module.exports = {
  preset: 'ts-jest',
  rootDir: __dirname,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^test/(.*)$': '<rootDir>/test/$1'
  },
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'json', 'lcov', 'text-summary'],
  collectCoverageFrom: [
    'src/**/*.ts'
  ]
}
