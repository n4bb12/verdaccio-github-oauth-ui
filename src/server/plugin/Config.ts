import { Config as VerdaccioConfig } from "@verdaccio/types"
import chalk from "chalk"
import { get } from "lodash"

import { logger } from "./logger"

//
// Constants
//

export const pluginName = "github-oauth-ui"
export const staticPath = "/-/static/" + pluginName
export const publicRoot = __dirname + "/public"
export const authorizePath = "/-/oauth/authorize"
export const callbackPath = "/-/oauth/callback"

//
// Types
//

export interface PluginConfig {
  "org": string,
  "client-id": string,
  "client-secret": string,
  "enterprise-origin"?: string,
}

export type PluginConfigKey = keyof PluginConfig

export interface Config extends VerdaccioConfig, PluginConfig {
  middlewares: { [pluginName]: PluginConfig }
  auth: { [pluginName]: PluginConfig },
}

//
// Access
//

export function getConfig(config: Config, key: PluginConfigKey): string {
  const value = null
    || get(config, `middlewares[${pluginName}][${key}]`)
    || get(config, `auth[${pluginName}][${key}]`)

  return process.env[value] || value
}

//
// Parsing
//

/**
 * user_agent: e.g. "verdaccio/4.3.4" --> 4
 */
export function getMajorVersion(config: Config) {
  return +config.user_agent[10]
}

export function getBaseUrl(config: Config) {
  const prefix = config.url_prefix
  if (prefix) {
    return prefix.replace(/\/?$/, "") // Remove potential trailing slash
  }
}

//
// Validation
//

function ensurePropExists(config: Config, key: PluginConfigKey) {
  const value = getConfig(config, key)

  if (!value) {
    logger.error(chalk.red(
      `[${pluginName}] ERR: Missing configuration "auth.${pluginName}.${key}"`))
    throw new Error("Please check your verdaccio config.")
  }
}

function ensureNodeIsNotEmpty(config: Config, node: keyof Config) {
  const path = `[${node}][${pluginName}]`
  const obj = get(config, path, {})

  if (!Object.keys(obj).length) {
    throw new Error(`"${node}.${pluginName}" must be enabled`)
  }
}

export function validateConfig(config: Config) {
  ensureNodeIsNotEmpty(config, "auth")
  ensureNodeIsNotEmpty(config, "middlewares")

  ensurePropExists(config, "org")
  ensurePropExists(config, "client-id")
  ensurePropExists(config, "client-secret")
}
