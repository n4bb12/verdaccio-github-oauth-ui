import colors from "picocolors"
import { plugin, pluginKey } from "./constants"

const prefix = colors.blue(`[${pluginKey}]`)

function toString(arg: unknown) {
  if (typeof arg === "string") {
    return arg
  }
  if (typeof arg === "object") {
    try {
      return JSON.stringify(arg)
    } catch {
      // ignore
    }
  }
  return String(arg)
}

export const logger = {
  log: (...args: any[]) => {
    console.log(prefix, args.map(toString).join(" "))
  },
  debug: (...args: any[]) => {
    console.debug(prefix, colors.gray(args.map(toString).join(" ")))
  },
  error: (...args: any[]) => {
    console.error(prefix, colors.red(args.map(toString).join(" ")))
  },
}

logger.log(`Version: ${plugin.name}@${plugin.version}`)
