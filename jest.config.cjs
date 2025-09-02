module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'js'],
  transform: { '^.+\\.ts$': ['ts-jest', { useESM: true }] },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: { '^src/(.*)$': '<rootDir>/src/$1' },
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: '<rootDir>/tsconfig.json'
    }
  }
};
