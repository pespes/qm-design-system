import type { Config } from 'jest';
import baseConfig from '../../jest.shared.ts';

const config: Config = {
  ...baseConfig,
  displayName: 'ui-tokens',
  roots: ['<rootDir>/src'],
  testMatch: ['<rootDir>/src/dictionary/tests/*.test.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/src/dictionary/tests/dictionary-helpers.test.ts',
  ],
};

export default config;
