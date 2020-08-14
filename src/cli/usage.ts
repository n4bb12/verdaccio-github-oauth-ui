import { pluginName } from "../constants"
import { logger } from "../logger"
import { getRegistry } from "./npm"

export function getUsageInfo() {
  return [
    "It seems you are using the default npm registry.",
    "Please update it to your Verdaccio URL by either running:",
    "",
    "npm config set registry <URL>",
    "",
    "or by using the registry argument",
    "",
    `npx verdaccio-${pluginName} --registry <URL>`,
  ]
}

export function printUsage() {
  getUsageInfo().forEach((line) => logger.log(line))
}

export function validateRegistry() {
  const registry = getRegistry()

  if (registry.includes("registry.npmjs.org")) {
    printUsage()
    process.exit(1)
  }

  return registry
}
