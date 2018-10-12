import { Config } from "../verdaccio"

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
}
