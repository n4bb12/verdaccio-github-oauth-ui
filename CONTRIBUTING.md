# Contributing

Contributions, are welcome. For feature or behavior change requests, please open
an issue first.

## Prerequisites

- You'll need these tools:
  [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) &middot;
  [Bash](https://www.google.de/search?q=install+bash) &middot; [Node
  LTS](https://nodejs.org/en/download) &middot; [Bun](https://bun.sh/)
- Install dependencies: `bun install`

## Development Commands

| Command         | Description                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| bun run build   | Build the plugin (compile code, etc.).                                                                  |
| bun clean       | Clear build output.                                                                                     |
| bun prepack     | Groups `clean` and `build`. Runs automatically when publishing.                                         |
| bun copy        | Copy the build output to the local plugin directory. This allows using it with a local Verdaccio setup. |
| bun start       | Start Verdaaccio using the local `verdaccio.yaml`.                                                      |
| bun run update  | Groups `prepack` and `copy`.                                                                            |
| bun dev         | Groups `update` and `start`.                                                                            |
| bun watch       | Runs `dev` with automatic restart when source files change.                                             |
| bun format      | Format code using `prettier`.                                                                           |
| bun typecheck   | Run `tsc` to verify TypeScript compiles.                                                                |
| bun fix         | Groups `format` and `typecheck`.                                                                        |
| bun run test    | Run unit tests with `vitest`.                                                                           |
| bun coverage    | Run unit tests with `vitest` and coverage report.                                                       |
| bun cli:login   | Sign in using the plugin CLI.                                                                           |
| bun cli:whoami  | Verify you are signed in in with npm.                                                                   |
| bun cli:publish | Perform an npm publish against a running local Verdaccio instance.                                      |
| bun cli         | Groups `cli:login`, `cli:whoami`, and `cli:publish`.                                                    |
| bun docker      | Starts a local Verdaccio using the local `Dockerfile` using the latest published version of the plugin. |
