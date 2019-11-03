import { pluginName } from "../constants"
import { logger } from "../logger"

export function printUsage() {
  logger.log("It seems you are using the default npm repository.")
  logger.log("Please update it to your verdaccio url by either running:")
  logger.log("")
  logger.log("npm config set registry <url>")
  logger.log("")
  logger.log("or by using the registry argument")
  logger.log("")
  logger.log(`verdaccio-${pluginName} --registry <url>`)
}
