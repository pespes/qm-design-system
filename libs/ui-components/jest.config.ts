import type { Config } from 'jest';
import baseConfig from '../../jest.shared.ts';

const config: Config = {
  ...baseConfig,
  displayName: 'ui-components',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.{ts,tsx}'],
};

export default config;
