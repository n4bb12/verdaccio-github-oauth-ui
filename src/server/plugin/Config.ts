import {
  Config as IncorrectVerdaccioConfig,
  PackageAccess as IncorrectVerdaccioPackageAccess,
  Security,
} from "@verdaccio/types"
import get from "lodash/get"
import assert from "ow"
import process from "process"
import { PartialDeep, RemoveIndexSignature } from "type-fest"
import { pluginKey, publicGitHubOrigin } from "../../constants"
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

export interface PluginConfig {
  "client-id": string
  "client-secret": string
  org: string | false
  "enterprise-origin"?: string | false
  "repository-access"?: boolean
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

function getEnvValue(name: any) {
  const value = process.env[String(name)]
  if (value === "true" || value === "false") {
    return value === "true"
  }
  return value
}

function getConfigValue<T>(config: Config, key: string, predicate: any): T {
  let valueOrEnvName =
    get(config, ["auth", pluginKey, key]) ??
    get(config, ["middlewares", pluginKey, key])

  const value = getEnvValue(valueOrEnvName) ?? valueOrEnvName

  try {
    assert(value, predicate)
  } catch (error) {
    logger.error(
      `Invalid configuration at "auth.${pluginKey}.${key}": ${error.message} — Please check your verdaccio config.`,
    )
    process.exit(1)
  }

  return value as T
}

//
// Access
//

export class ParsedPluginConfig {
  public readonly packages = this.config.packages ?? {}
  public readonly url_prefix = this.config.url_prefix ?? ""

  public readonly org =
    getConfigValue<string | false>(
      this.config,
      "org",
      assert.any(
        assert.string.nonEmpty.not.startsWith(publicGitHubOrigin),
        assert.boolean.false,
      ),
    ) ?? false

  public readonly clientId = getConfigValue<string>(
    this.config,
    "client-id",
    assert.string.nonEmpty,
  )

  public readonly clientSecret = getConfigValue<string>(
    this.config,
    "client-secret",
    assert.string.nonEmpty,
  )

  public readonly enterpriseOrigin =
    getConfigValue<string | false>(
      this.config,
      "enterprise-origin",
      assert.any(
        assert.undefined,
        assert.string.url.nonEmpty.not.startsWith(publicGitHubOrigin),
        assert.boolean.false,
      ),
    ) ?? false

  public readonly repositoryAccess =
    getConfigValue<boolean>(
      this.config,
      "repository-access",
      assert.optional.boolean,
    ) ?? true

  constructor(public readonly config: Config) {
    validateVersion()

    validateNodeExists(config, "middlewares")
    validateNodeExists(config, "auth")
  }
}
