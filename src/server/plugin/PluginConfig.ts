import { Config } from "@verdaccio/types"

export interface MiddlewaresConfig {
  "client-id": string,
  "client-secret": string,
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

export const pluginName = "github-oauth-ui"

export function getConfig<Key extends keyof MiddlewaresConfig>(config: PluginConfig, key: Key): string {
  const value = config.middlewares[pluginName][key]
  return process.env[value]! || value
}
