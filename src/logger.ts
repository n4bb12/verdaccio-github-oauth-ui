import chalk from "chalk"

import { pluginName } from "./constants"

const prefix = chalk.blue(`[${pluginName}]`)

export const logger = {
  log: console.log.bind(console, prefix),
  error: console.error.bind(console, prefix),
}

const plugin = require(__dirname + "/../package.json")
logger.log(`Version: ${plugin.name}@${plugin.version}`)
