import { Config as VerdaccioConfig } from "@verdaccio/types"
import get from "lodash/get"
import assert from "ow"
import process from "process"
import { pluginKey, publicGitHubOrigin } from "../../constants"
import { logger } from "../../logger"

//
// Types
//

export interface PluginConfig {
  "client-id": string
  "client-secret": string
  token: string
  "enterprise-origin"?: string
  "cache-ttl-ms"?: number
}

export interface VerdaccioGithubOauthConfig extends VerdaccioConfig {
  middlewares: { [key: string]: PluginConfig }
  auth: { [key: string]: PluginConfig }
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

function validateNodeExists(
  config: VerdaccioGithubOauthConfig,
  node: keyof VerdaccioGithubOauthConfig,
) {
  const path = `[${node}][${pluginKey}]`
  const obj = get(config, path, {})

  if (!Object.keys(obj).length) {
    throw new Error(`"${node}.${pluginKey}" must be enabled`)
  }
}

function getConfigValue<T>(
  config: VerdaccioGithubOauthConfig,
  key: string,
  predicate: any,
): T {
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
  readonly url_prefix: string
  readonly clientId: string
  readonly clientSecret: string
  readonly token: string
  readonly enterpriseOrigin: string | undefined
  readonly cacheTTLms: number | undefined

  constructor(readonly config: VerdaccioGithubOauthConfig) {
    validateVersion()

    validateNodeExists(config, "middlewares")
    validateNodeExists(config, "auth")

    this.url_prefix = this.config.url_prefix ?? ""

    this.clientId = getConfigValue<string>(
      this.config,
      "client-id",
      assert.string.nonEmpty,
    )

    this.clientSecret = getConfigValue<string>(
      this.config,
      "client-secret",
      assert.string.nonEmpty,
    )

    this.token = getConfigValue<string>(
      this.config,
      "token",
      assert.string.nonEmpty,
    )

    this.enterpriseOrigin = getConfigValue<string | undefined>(
      this.config,
      "enterprise-origin",
      assert.any(
        assert.undefined,
        assert.string.url.nonEmpty.not.startsWith(publicGitHubOrigin),
      ),
    )

    this.cacheTTLms = getConfigValue<number>(
      this.config,
      "cache-ttl-ms",
      assert.any(assert.undefined, assert.number.positive),
    )

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
