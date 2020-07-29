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

  async createUiCallbackUrl(token: string, username: string): Promise<string> {
    const user = this.createAuthenticatedUser(username)

    const uiToken = await this.verdaccio.issueUiToken(user)
    const npmToken = await this.verdaccio.issueNpmToken(token, user)

    const query = { username, uiToken, npmToken }
    const url = "/?" + stringify(query)

    return url
  }

  authenticate(username: string, groups: string[]): boolean {
    const success = groups.includes(this.requiredOrgName)

    if (!success) {
      logger.error(this.getDeniedMessage(username))
    }

    return success
  }

  private getDeniedMessage(username: string) {
    return `Access denied: User "${username}" is not a member of "${this.requiredOrgName}"`
  }
}
