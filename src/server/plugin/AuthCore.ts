import uniq from "lodash/uniq"
import { stringify } from "querystring"

import { logger } from "../../logger"
import { User, Verdaccio } from "../verdaccio"
import { Config, getConfig } from "./Config"

export class AuthCore {
  private readonly requiredOrg = "github/" + getConfig(this.config, "org")
  private readonly configuredGroups = this.getConfiguredGroups()

  constructor(
    private readonly verdaccio: Verdaccio,
    private readonly config: Config,
  ) {}

  /**
   * Returns all permission groups used in the Verdacio config.
   */
  getConfiguredGroups() {
    const configuredGroups: Record<string, true> = {}
    Object.values(this.config.packages || {}).forEach((packageConfig) => {
      ;["access", "publish"]
        .map((key) => packageConfig[key])
        .filter(Boolean)
        .forEach((value) => {
          const group = process.env[value] || value
          configuredGroups[group] = true
        })
    })
    return configuredGroups
  }

  async createAuthenticatedUser(
    username: string,
    providerGroups: string[],
  ): Promise<User> {
    const relevantGroups = providerGroups.filter(
      (group) => group in this.configuredGroups,
    )

    // See https://verdaccio.org/docs/en/packages
    const user: User = {
      name: username,
      groups: ["$all", "@all", "$authenticated", "@authenticated"],
      real_groups: uniq([username, this.requiredOrg, ...relevantGroups]),
    }
    logger.log("Created authenticated user", user)

    return user
  }

  async createUiCallbackUrl(
    username: string,
    token: string,
    groups: string[],
  ): Promise<string> {
    const user = await this.createAuthenticatedUser(username, groups)

    const uiToken = await this.verdaccio.issueUiToken(user)
    const npmToken = await this.verdaccio.issueNpmToken(token, user)

    const query = { username, uiToken, npmToken }
    const url = "/?" + stringify(query)

    return url
  }

  authenticate(username: string, groups: string[]): boolean {
    if (!groups.includes(this.requiredOrg)) {
      logger.error(
        `Access denied: User "${username}" is not a member of  "${this.requiredOrg}"`,
      )
      return false
    }

    return true
  }
}
