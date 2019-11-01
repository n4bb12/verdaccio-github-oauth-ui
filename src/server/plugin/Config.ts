import { Config } from "@verdaccio/types"
import chalk from "chalk"
import { get } from "lodash"

export const pluginName = "github-oauth-ui"
export const publicRoot = __dirname + "/public"

export interface PluginConfigProps {
  "org": string,
  "client-id": string,
  "client-secret": string,
  "enterprise-origin"?: string,
}

export type PluginConfigKey = keyof PluginConfigProps

export interface PluginConfig extends Config, PluginConfigProps {
  middlewares: { [pluginName]: PluginConfigProps }
  auth: { [pluginName]: PluginConfigProps },
}

export function getConfig(config: PluginConfig, key: PluginConfigKey): string {
  const value = null
    || get(config, `middlewares[${pluginName}][${key}]`)
    || get(config, `auth[${pluginName}][${key}]`)

  return process.env[value] || value
}

/**
 * user_agent: e.g. "verdaccio/4.3.4" --> 4
 */
export function getMajorVersion(config: PluginConfig) {
  return +config.user_agent[10]
}

export function getBaseUrl(config: PluginConfig) {
  const prefix = config.url_prefix
  if (prefix) {
    return prefix.replace(/\/?$/, "") // Remove potential trailing slash
  }
}

function ensurePropExists(config: PluginConfig, key: PluginConfigKey) {
  const value = getConfig(config, key)

  if (!value) {
    console.error(chalk.red(
      `[${pluginName}] ERR: Missing configuration "auth.${pluginName}.${key}"`))
    throw new Error("Please check your verdaccio config.")
  }
}

function ensureNodeIsNotEmpty(config: PluginConfig, node: keyof PluginConfig) {
  const path = `[${node}][${pluginName}]`
  const obj = get(config, path, {})

  if (!Object.keys(obj).length) {
    throw new Error(`"${node}.${pluginName}" must be enabled`)
  }
}

export function validateConfig(config: PluginConfig) {
  ensureNodeIsNotEmpty(config, "auth")
  ensureNodeIsNotEmpty(config, "middlewares")

  ensurePropExists(config, "org")
  ensurePropExists(config, "client-id")
  ensurePropExists(config, "client-secret")
}
