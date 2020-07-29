import { intersection } from "lodash"
import { stringify } from "querystring"

import { logger } from "../../logger"
import { User, Verdaccio } from "../verdaccio"
import { Config, getConfig } from "./Config"

export class AuthCore {
  private readonly requiredOrgName = getConfig(this.config, "org")

  constructor(
    private readonly verdaccio: Verdaccio,
    private readonly config: Config,
  ) {}

  createAuthenticatedUser(username: string): User {
    // See https://verdaccio.org/docs/en/packages
    return {
      name: username,
      groups: ["$all", "@all", "$authenticated", "@authenticated"],
      real_groups: [username, this.requiredOrgName],
    }
  }

  async createUiCallbackUrl(token: string, username: string) {
    const user = this.createAuthenticatedUser(username)

    const uiToken = await this.verdaccio.issueUiToken(user)
    const npmToken = await this.verdaccio.issueNpmToken(token, user)

    const query = { username, uiToken, npmToken }
    const url = "/?" + stringify(query)

    return url
  }

  canAuthenticate(username: string, groups: string[]) {
    const allow = groups.includes(this.requiredOrgName)
    if (!allow) {
      logger.error(this.getDeniedMessage(username))
    }
    return allow
  }

  /**
   * In our context $authenticated means the user is a member of the GitHub org.
   * Therefore, add the configured org name as a required group.
   * The membership for this group is added to the user after successful authentication with GitHub
   * and after verifying that the user is a member of that org.
   */
  canAccess(username: string, groups: string[], requiredGroups: string[]) {
    if (
      requiredGroups.includes(
        "$authenticated" || requiredGroups.includes("@authenticated"),
      )
    ) {
      requiredGroups.push(this.requiredOrgName)
    }

    const isMemberOfAllRequiredGroups =
      intersection(groups, requiredGroups).length === requiredGroups.length

    if (!isMemberOfAllRequiredGroups) {
      logger.error(this.getDeniedMessage(username))
    }

    return isMemberOfAllRequiredGroups
  }

  getDeniedMessage(username: string) {
    return `Access denied: User "${username}" is not a member of "${this.requiredOrgName}"`
  }
}
