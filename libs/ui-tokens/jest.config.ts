import type { Config } from 'jest';
import baseConfig from '../../jest.shared.ts'; // Note the .js extension for ESM resolution

const config: Config = {
  ...baseConfig,
  displayName: 'ui-tokens',
  roots: ['<rootDir>/src'],
  testMatch: ['**/tests/**/*.test.ts'],
};

export default config;
