# QM UI

This project is structured as a monorepo managed by Nx and pnpm, focusing on the design token pipeline and QM component library.

## Monorepo Management

The project is organized as a monorepo using `Nx` and `pnpm`. This setup allows the management of multiple libraries in a single repo while keeping build processes and dependencies separated.

#### Configuration Structure

Global defaults for the project are found at the root in `nx.json`. This is where common tasks like `lint`, `test`, `typecheck` and `build` are defined. Individual libraries use a local `project.json` file to inherit these default tasks by assigning an empty object, or apply additional configuration or overrides with library-specific execution logic.

#### Tasks and Caching

Nx handles all task execution and caching across the repo. Task dependencies are defined in the root `nx.json` to help with the coordination of builds by ensuring the correct execution order. For instance, because `ui-components` depends on the css file created by `ui-tokens`, Nx is configured to automatically trigger a token build whenever a build is initiated for `ui-components`.
Tasks are also handled efficiently through caching performed by Nx. Nx monitors file changes and only executes tasks when necessary. If there are no changes in code for a package since last run, Nx will immediately return results from the cache.

#### Dependency Boundaries

The monorepo structure helps enforce architectural rules. The key boundary to note in the repo is that `ui-tokens` is forbidden from importing anything from `ui-components`. This prevents any circular dependencies and ensures that design tokens can be distributed and consumed independently in any consuming repo. 

## Development
Packages can be managed individually but the root `package.json` provides the standard commands to interact with the entire repo. After running `pnpm install`, all of these commands from the root directory:
`pnpm build:tokens` // Generates the CSS and Native styles from the DTCG tokens
`pnpm build:components` // Compiles the component library (automatically ensuring tokens are up to date)
`pnpm storybook` // Launches storybook hosting component documentation and sandbox environment to interact
`pnpm typecheck` // Project wide typescript check
`pnpm lint` // Project wide eslint check
`pnpm jest` // Project wide execution of Jest tests

### Commits and Git Workflow
We use the [Conventional Commits](https://www.notion.so/Conventional-Commits-1194dc390c858036b48ffb2a73c8f3e6) specification for commit messages. 


Because this is a mono-repo with both ui-tokens and ui-components packages, it is necessary to scope your commit message to the relevant package in order to allow releases to properly map commits to correct packages. For example, if you are working within ui-tokens, your commit message should start with `feat(ui-tokens):`. If you are working on the ui-components, it should start with `feat(ui-components):`. If you are working on architecture outside of these two packages (which would therefore always fall into a non-release-tiggering type such as `build` or `ci`), the appropriate scope would be `<type>(repo)`

All commit messages must follow the following signature:
```
<type>(scope): <subject>
feat(ui-components): add SelectComponent
```

## Libraries
To find out more about each of the libraries within `qm-ui`, refer to the library README.md file:

- [ui-components](./libs/ui-components/README.md)
- [ui-tokens](./libs/ui-tokens/README.md)
