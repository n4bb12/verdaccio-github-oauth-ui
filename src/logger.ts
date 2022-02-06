import chalk from "chalk"
import { pluginName } from "./constants"

const prefix = chalk.blue(`[${pluginName}]`)

export const logger = {
  log: console.log.bind(console, prefix),
  error: (...args: any[]) => console.error(prefix, chalk.red(args.join(" "))),
}

const plugin = require("../package.json")
logger.log(`Version: ${plugin.name}@${plugin.version}`)
