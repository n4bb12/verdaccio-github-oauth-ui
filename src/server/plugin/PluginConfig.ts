import { get } from "lodash"

import { Config } from "../verdaccio-types"

export interface MiddlewaresConfig {
  "client-id": string,
  "client-secret": string,
  "github-enterprise-hostname": string,
}

export interface AuthConfig {
  org: string,
}

export interface PluginConfig extends Config, MiddlewaresConfig, AuthConfig {
  middlewares: {
    "github-oauth-ui": MiddlewaresConfig,
  }
  auth: {
    "github-oauth-ui": AuthConfig,
  },
  [index: string]: any
}

export type ConfigKey = keyof MiddlewaresConfig | keyof AuthConfig

export const pluginName = "github-oauth-ui"

export function getConfig(config: PluginConfig, key: ConfigKey): string {
  const value = get(config, `middlewares[${pluginName}][${key}]`) || get(config, `auth[${pluginName}][${key}]`)
  return process.env[value]! || value
}
