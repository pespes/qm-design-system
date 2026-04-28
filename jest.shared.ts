import type { Config } from 'jest';

const esmLibs = ['style-dictionary', 'is-plain-obj', 'lodash-es'];

const sharedConfig: Config = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  transformIgnorePatterns: [
    `node_modules/.pnpm/(?!(${esmLibs.join('|')})@)`,
  ],
};

export default sharedConfig;