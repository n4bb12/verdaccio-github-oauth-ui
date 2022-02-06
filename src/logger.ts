import chalk from "chalk"
import { plugin, pluginKey } from "./constants"

const prefix = chalk.blue(`[${pluginKey}]`)

export const logger = {
  log: console.log.bind(console, prefix),
  error: (...args: any[]) => console.error(prefix, chalk.red(args.join(" "))),
}

logger.log(`Version: ${plugin.name}@${plugin.version}`)
