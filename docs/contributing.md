# Contributing

All contributions, are welcome. If you have a feature idea, please open an issue
first.

## Prerequisites

- You'll need these tools:
  [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) &middot;
  [Bash](https://www.google.de/search?q=install+bash) &middot; [Node
  LTS](https://nodejs.org/en/download) &middot; [Yarn
  Berry](https://yarnpkg.com/lang/en/docs/install)
- Install dependencies: `yarn install`

## Development Commands

| Command          | Description                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| yarn build       | Build the plugin (compile code, etc.).                                                                  |
| yarn clean       | Clear build output.                                                                                     |
| yarn prepack     | Groups `clean` and `build`. Runs automatically when publishing.                                         |
| yarn copy        | Copy the build output to the local plugin directory. This allows using it with a local Verdaccio setup. |
| yarn start       | Start Verdaaccio using the local `verdaccio.yaml`.                                                      |
| yarn update      | Groups `prepack` and `copy`.                                                                            |
| yarn dev         | Groups `update` and `start`.                                                                            |
| yarn watch       | Runs `dev` with automatic restart when source files change.                                             |
| yarn format      | Format code using `prettier`.                                                                           |
| yarn typecheck   | Run `tsc` to verify TypeScript compiles.                                                                |
| yarn fix         | Groups `format` and `typecheck`.                                                                        |
| yarn test        | Run unit tests with `vitest`.                                                                           |
| yarn coverage    | Run unit tests with `vitest` and coverage report.                                                       |
| yarn cli:login   | Sign in using the plugin CLI.                                                                           |
| yarn cli:whoami  | Verify you are signed in in with npm.                                                                   |
| yarn cli:publish | Perform an npm publish against a running local Verdaccio instance.                                      |
| yarn cli         | Groups `cli:login`, `cli:whoami`, and `cli:publish`.                                                    |
| yarn docker      | Starts a local Verdaccio using the local `Dockerfile` using the latest published version of the plugin. |
