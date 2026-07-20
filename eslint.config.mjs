import nx from "@nx/eslint-plugin";
import globals from "globals";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import jest from "eslint-plugin-jest";
import jsxA11y from "eslint-plugin-jsx-a11y";
import quartermasterPlugin from "@quartermaster/eslint-plugin-quartermaster";
import { defineConfig } from "eslint/config";


export default defineConfig([
  ...nx.configs["flat/base"],
  ...nx.configs["flat/typescript"],
  ...nx.configs["flat/javascript"],
  ...tseslint.configs.recommended,
  // Module specific boundaries - ui-components can import from ui-tokens, but not vice versa
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: [
            "^.*/eslint\\.config\\.[cm]?js$",
             "^.*/jest.shared.ts",
          ],
          depConstraints: [
            {
              sourceTag: "scope:shared",
              onlyDependOnLibsWithTags: ["scope:shared"],
              bannedExternalImports: ["@Quartermaster-Inc/ui-components"],
            },
            {
              sourceTag: "scope:ui",
              onlyDependOnLibsWithTags: ["scope:ui", "scope:shared"],
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx,js,jsx, mjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      prettier,
      jest,
      "@typescript-eslint": tseslint.plugin,
      import: importPlugin,
      "jsx-a11y": jsxA11y,
      quartermaster: quartermasterPlugin,
    },
    rules: {
      "quartermaster/require-testid-interactive": "error",
      "quartermaster/no-internal-imports": [
        "error",
        {
          pattern: "^@Quartermaster-Inc/ui-tokens-[^/]+/.+",
        },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrors: "none",
          varsIgnorePattern: "^_",
        },
      ],
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/order": "error",
      "no-nested-ternary": "error",
      "no-unneeded-ternary": "warn",
      "object-shorthand": "error",
      "prettier/prettier": ["error"],
    },
  },
  {
    files: ["**/*.test.{ts,tsx,js}", "**/*.spec.{ts,tsx,js}"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      ...jest.configs.recommended.rules,
    },
  },
  {
    files: ["**/index.ts"],
    rules: {
      "import/prefer-default-export": "off",
    },
  },
  {
    ignores: [
      "node_modules/",
      "libs/*/node_modules",
      "**/dist/**",
      "libs/*/build",
    ],
  },
]);
