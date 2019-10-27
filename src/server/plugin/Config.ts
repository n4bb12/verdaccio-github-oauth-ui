import { Config } from "@verdaccio/types"
import { get } from "lodash"

export const pluginName = "github-oauth-ui"

export interface PluginConfigProps {
  "org": string,
  "client-id": string,
  "client-secret": string,
  "github-enterprise-hostname": string,
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
