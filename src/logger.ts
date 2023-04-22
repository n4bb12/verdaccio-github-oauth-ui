import colors from "picocolors"
import { plugin, pluginKey } from "./constants"

const prefix = colors.blue(`[${pluginKey}]`)

export const logger = {
  log: console.log.bind(console, prefix),
  error: (...args: any[]) => console.error(prefix, colors.red(args.join(" "))),
}

logger.log(`Version: ${plugin.name}@${plugin.version}`)
