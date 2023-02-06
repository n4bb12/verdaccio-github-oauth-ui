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

export interface PluginConfig {
  "client-id": string
  "client-secret": string
  domain?: string
}

export interface Config extends VerdaccioConfig {
  middlewares: { [key: string]: PluginConfig }
  auth: { [key: string]: PluginConfig }
}

export interface GroupParts {
  providerId?: string
  key1?: string
  value1?: string
  key2?: string
  value2?: string
  key3?: string
}

export type ParsedUser = {
  group: string
  user: string
}

export type ParsedOrg = {
  group: string
  org: string
}

export type ParsedTeam = {
  group: string
  org: string
  team: string
}

export type ParsedRepo = {
  group: string
  owner: string
  repo: string
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

  return value as T
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
    assert.any(assert.undefined, assert.string.url.nonEmpty),
  )

  constructor(readonly config: Config) {
    validateVersion()

    validateNodeExists(config, "middlewares")
    validateNodeExists(config, "auth")

    this.parseConfiguredPackageGroups()
  }

  readonly configuredGroupsMap: Record<string, boolean> = {}
  readonly parsedUsers: ParsedUser[] = []
  readonly parsedOrgs: ParsedOrg[] = []
  readonly parsedTeams: ParsedTeam[] = []
  readonly parsedRepos: ParsedRepo[] = []

  isGroupConfigured(group: string) {
    return !!this.configuredGroupsMap[group]
  }

  /**
   * Returns all permission groups used in the Verdacio config.
   */
  private parseConfiguredPackageGroups() {
    const configuredGroups = Object.values(this.config.packages || {}).flatMap(
      (packageConfig) => {
        return ["access", "publish", "unpublish"].flatMap((action) => {
          const allowedGroups = packageConfig[action]

          if (typeof allowedGroups === "string") {
            return allowedGroups
          }

          if (
            Array.isArray(allowedGroups) &&
            allowedGroups.every((group) => typeof group === "string")
          ) {
            return allowedGroups as string[]
          }

          return []
        })
      },
    )

    const configuredGroupsDeduped = [...new Set(configuredGroups)]

    configuredGroupsDeduped.forEach((group) => {
      const [providerId, key1, value1, key2, value2, key3] = group.split("/")

      if (providerId !== "github") {
        return null
      }

      if (key1 === "user" && !key2) {
        const parsedUser: ParsedUser = {
          group,
          user: value1,
        }
        this.parsedUsers.push(parsedUser)
        this.configuredGroupsMap[group] = true
      }

      if (key1 === "org" && key2 === "team" && !key3) {
        const parsedTeam: ParsedTeam = {
          group,
          org: value1,
          team: value2,
        }
        this.parsedTeams.push(parsedTeam)
        this.configuredGroupsMap[group] = true
      }

      if ((key1 === "org" || key1 === "user") && key2 === "repo" && !key3) {
        const parsedRepo: ParsedRepo = {
          group,
          owner: value1,
          repo: value2,
        }
        this.parsedRepos.push(parsedRepo)
        this.configuredGroupsMap[group] = true
      }

      if (key1 === "org" && !key2) {
        const parsedOrg: ParsedOrg = {
          group,
          org: value1,
        }
        this.parsedOrgs.push(parsedOrg)
        this.configuredGroupsMap[group] = true
      }
    })
  }
}
