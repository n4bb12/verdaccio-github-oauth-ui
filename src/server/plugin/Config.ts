import { Config } from "@verdaccio/types"
import chalk from "chalk"
import { get } from "lodash"

export const pluginName = "gitlab-oauth-ui"

export interface PluginConfigProps {
  "group": string,
  "client-id": string,
  "client-secret": string,
  "gitlab-host": string,
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

function ensurePropExists(config: PluginConfig, key: PluginConfigKey) {
  const value = getConfig(config, key)

  if (!value) {
    console.error(chalk.red(
      `[${pluginName}] ERR: Missing configuration "auth[${pluginName}][${key}]". Please check your verdaccio config.`))
    process.exit(1)
  }
}

export function validateConfig(config: PluginConfig) {
  ensurePropExists(config, "group")
  ensurePropExists(config, "client-id")
  ensurePropExists(config, "client-secret")
}
