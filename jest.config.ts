import type { Config } from 'jest';

const esmLibs = [
  'style-dictionary',
  'is-plain-obj' 
]

const config: Config = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transformIgnorePatterns: [
    `<rootDir>/node_modules/.pnpm/(?!(${esmLibs.join('|')})@)`,
  ],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
};

export default config;
