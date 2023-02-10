import {
  Config as IncorrectVerdaccioConfig,
  PackageAccess as IncorrectVerdaccioPackageAccess,
  Security,
} from "@verdaccio/types"
import get from "lodash/get"
import assert from "ow"
import process from "process"
import { PartialDeep, RemoveIndexSignature } from "type-fest"
import { pluginKey } from "../../constants"
import { logger } from "../../logger"

//
// Types
//

// Verdaccio incorrectly types some of these as string arrays
// although they are all strings.
export interface PackageAccess extends IncorrectVerdaccioPackageAccess {
  unpublish?: string[]
}

export type VerdaccioConfig = Omit<
  RemoveIndexSignature<IncorrectVerdaccioConfig>,
  "packages" | "security"
> & {
  packages?: Record<string, PackageAccess>
  security?: PartialDeep<Security>
}

export interface GroupsConfig {
  "key-info": string
  "impersonation-account": string
  "allowed-groups"?: string[]
}

export interface PluginConfig {
  "client-id": string
  "client-secret": string
  "domain"?: string
  "consent"?: string
  "group-config"?: GroupsConfig
}

export interface Config extends VerdaccioConfig {
  middlewares: { [key: string]: PluginConfig }
  auth: { [key: string]: PluginConfig }
}

/**
 * e.g. "5.0.4"
 */
export function getVersion(): string {
  return require("verdaccio/package.json").version
}

//
// Validation
//

function validateVersion() {
  const version = getVersion()

  if (version < "5") {
    throw new Error("This plugin requires verdaccio 5 or above")
  }
}

function validateNodeExists(config: Config, node: keyof Config) {
  const path = `[${node}][${pluginKey}]`
  const obj = get(config, path, {})

  if (!Object.keys(obj).length) {
    throw new Error(`"${node}.${pluginKey}" must be enabled`)
  }
}

function getConfigValue<T>(config: Config, key: string, predicate: any): T {

  let valueOrEnvName = get(config, ["auth", pluginKey, key])

  const value = process.env[String(valueOrEnvName)] ?? valueOrEnvName

  try {
    assert(value, predicate)
  } catch (error) {
    logger.error(
      `Invalid configuration at "auth.${pluginKey}.${key}": ${error.message} — Please check your verdaccio config.`,
    )
    process.exit(1)
  }
  let v = value as T

  // This is so we can check each object value for environment variables
  if (typeof v === "object") {
    for (const i in v){
      const val = v[i]
      valueOrEnvName = get(config, ["auth", pluginKey, key, i])
      v[i] = process.env[String(valueOrEnvName)] ?? valueOrEnvName
    }
  }

  return v
}

//
// Implementation
//

export class ParsedPluginConfig {
  readonly url_prefix = this.config.url_prefix ?? ""

  readonly clientId = getConfigValue<string>(
    this.config,
    "client-id",
    assert.string.nonEmpty,
  )

  readonly clientSecret = getConfigValue<string>(
    this.config,
    "client-secret",
    assert.string.nonEmpty,
  )

  readonly domain = getConfigValue<string | undefined>(
    this.config,
    "domain",
    assert.optional.string,
  )

  readonly prompt = getConfigValue<string | undefined>(
    this.config,
    "prompt",
    assert.optional.string,
  )

  readonly groupsConfig = getConfigValue<GroupsConfig | undefined>(
    this.config,
    "group-config",
    assert.optional.object
  )

  constructor(readonly config: Config) {
    validateVersion()

    validateNodeExists(config, "middlewares")
    validateNodeExists(config, "auth")

  }



}
