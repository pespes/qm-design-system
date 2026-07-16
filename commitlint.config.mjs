const Configuration = {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        'subject-includes-ticket': ({subject}) => [
          subject !== null && /QP-\d+/.test(subject),
          'subject must reference ticket number, eg. "QP-20001"',
        ],
      },
    },
  ],
  ignores: [
    (commitMsg) => /^chore\(release\): publish versions \[skip ci\]/.test(commitMsg),
    (commitMsg) => /^chore: merge main into development \[skip ci\]/.test(commitMsg),
  ],
  // Breaking changes are supported using the '!' syntax: feat!:
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // A new feature
        'fix', // A bug fix
        'docs', // Documentation only changes
        'style', // Changes that do not affect the meaning of the code
        'refactor', // A code change that neither fixes a bug nor adds a feature
        'perf', // A code change that improves performance
        'test', // Adding missing tests or correcting existing tests
        'build', // Changes that affect the build system or external dependencies
        'ci', // Changes to CI configuration files and scripts
        'chore', // Other changes that don't modify src or test files
        'revert' // Reverts a previous commit
      ]
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    // ui-components depends on ui-tokens - to prevent nx from assigning ui-components a breaking change bump
    // when ui-tokens has one, add scope
    'scope-enum': [
      2,
      'always',
      {
        scopes: [
          'ui-tokens',
          'ui-components',
          'repo',
        ]
      }
    ],
    'scope-case': [2, 'always', 'lower-case'],
    'scope-empty': [2, 'never'],
    'subject-case': [0, 'always', []], // Disabled to allow ticket numbers and capitals
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-includes-ticket': [2, 'always'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always']
  },
  /*
   * Custom URL to show upon failure
   */
  helpUrl: "https://github.com/conventional-changelog/commitlint/#what-is-commitlint",
};

export default Configuration;