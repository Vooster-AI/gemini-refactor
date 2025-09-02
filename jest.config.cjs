module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'js'],
  transform: { '^.+\.ts$': ['ts-jest', { useESM: true }] },
  moduleNameMapper: { '^src/(.*)$': '<rootDir>/src/' }
};
