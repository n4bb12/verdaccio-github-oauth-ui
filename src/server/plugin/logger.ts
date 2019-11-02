import chalk from "chalk"

const prefix = chalk.blue("[github-oauth-ui]")

// tslint:disable: no-console
export const logger = {
  log: console.log.bind(console, prefix),
  error: console.error.bind(console, prefix),
}
