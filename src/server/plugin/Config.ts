import {
  Config as IncorrectVerdaccioConfig,
  PackageAccess as IncorrectVerdaccioPackageAccess,
} from "@verdaccio/types"
import chalk from "chalk"
import get from "lodash/get"
import ow from "ow"
import { pluginName, publicGitHubOrigin } from "../../constants"
import { logger } from "../../logger"

//
// Types
//

// Verdaccio incorrectly types some of these as string arrays
// although they are all strings.
export interface PackageAccess extends IncorrectVerdaccioPackageAccess {
  unpublish?: string[]
}

export type VerdaccioConfig = Omit<IncorrectVerdaccioConfig, "packages"> & {
  packages?: Record<string, PackageAccess>
}

export interface PluginConfig {
  "client-id": string
  "client-secret": string
  org: string | false
  "enterprise-origin"?: string | false
}

export type PluginConfigKey = keyof PluginConfig

export interface Config extends VerdaccioConfig {
  middlewares: { [pluginName]: PluginConfig }
  auth: { [pluginName]: PluginConfig }
}

//
// Access
//

export function getConfig(config: Config, key: PluginConfigKey): string {
  const value =
    get(config, `middlewares[${pluginName}][${key}]`) ??
    get(config, `auth[${pluginName}][${key}]`)

  return process.env[value] || value
}

/**
 * e.g. "5.0.4" --> 5
 */
export function getMajorVersion() {
  const version = require("verdaccio/package.json").version
  return +version.replace(/^(\d+).\d+.\d+$/, "$1")
}

//
// Validation
//

function validateProp(config: Config, key: PluginConfigKey, predicate: any) {
  const value = getConfig(config, key)

  try {
    ow(value, predicate)
  } catch (error) {
    logger.error(
      chalk.red(
        `[${pluginName}] ERR: Invalid configuration at "auth.${pluginName}.${key}": ${error.message}`,
      ),
    )
    throw new Error("Please check your verdaccio config.")
  }
}

function ensureObjectNotEmpty(config: Config, node: keyof Config) {
  const path = `[${node}][${pluginName}]`
  const obj = get(config, path, {})

  if (!Object.keys(obj).length) {
    throw new Error(`"${node}.${pluginName}" must be enabled`)
  }
}

export function validateConfig(config: Config) {
  const majorVersion = getMajorVersion()

  if (majorVersion < 5) {
    throw new Error("This plugin requires verdaccio 5 or above")
  }

  ensureObjectNotEmpty(config, "auth")
  ensureObjectNotEmpty(config, "middlewares")

  validateProp(config, "client-id", ow.string.nonEmpty)
  validateProp(config, "client-secret", ow.string.nonEmpty)
  validateProp(
    config,
    "org",
    ow.any(
      ow.string.nonEmpty.not.startsWith(publicGitHubOrigin),
      ow.boolean.false,
    ),
  )
  validateProp(
    config,
    "enterprise-origin",
    ow.any(
      ow.undefined,
      ow.string.url.nonEmpty.not.startsWith(publicGitHubOrigin),
      ow.boolean.false,
    ),
  )
}
