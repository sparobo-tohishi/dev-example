module.exports = {
  roots: [
    '<rootDir>/test',
  ],
  testMatch: [
    '<rootDir>/test/*.ts',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
}
