import uniq from "lodash/uniq"
import { stringify } from "querystring"
import { authenticatedUserGroups } from "../../constants"
import { logger } from "../../logger"
import { User, Verdaccio } from "../verdaccio"
import { ParsedPluginConfig } from "./Config"

export class AuthCore {
  private readonly requiredGroup = this.config.org
    ? "github/owner/" + this.config.org
    : null
  private readonly configuredGroups = this.getConfiguredGroups()

  constructor(
    private readonly verdaccio: Verdaccio,
    private readonly config: ParsedPluginConfig,
  ) {}

  /**
   * Returns all permission groups used in the Verdacio config.
   */
  getConfiguredGroups() {
    const configuredGroups: Record<string, true> = {}
    Object.values(this.config.packages || {}).forEach((packageConfig) => {
      ;["access", "publish", "unpublish"]
        .flatMap((key) => packageConfig[key])
        .filter(Boolean)
        .forEach((group: string) => {
          configuredGroups[group] = true
        })
    })
    return configuredGroups
  }

  async createAuthenticatedUser(
    username: string,
    groups: string[],
  ): Promise<User> {
    const relevantGroups = groups.filter(
      (group) => group in this.configuredGroups,
    )

    relevantGroups.push(username)

    if (this.requiredGroup) {
      relevantGroups.push(this.requiredGroup)
    }

    const user: User = {
      name: username,
      groups: [...authenticatedUserGroups],
      real_groups: uniq(relevantGroups.filter(Boolean).sort()),
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
    if (this.requiredGroup && !groups.includes(this.requiredGroup)) {
      logger.error(
        `Access denied: User "${username}" is not a member of "${this.requiredGroup}"`,
      )
      return false
    }

    if (!groups.length) {
      logger.error(`Access denied: User "${username}" does not have any groups`)
      return false
    }

    return true
  }
}
