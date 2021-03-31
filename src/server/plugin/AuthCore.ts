import { stringify } from "querystring"

import { logger } from "../../logger"
import { User, Verdaccio } from "../verdaccio"
import { Config, getConfig } from "./Config"

export class AuthCore {
  private readonly requiredGroup = "github/" + getConfig(this.config, "org")

  constructor(
    private readonly verdaccio: Verdaccio,
    private readonly config: Config,
  ) {}

  async createAuthenticatedUser(
    username: string,
    groups: string[],
  ): Promise<User> {
    // See https://verdaccio.org/docs/en/packages
    const user: User = {
      name: username,
      groups: ["$all", "@all", "$authenticated", "@authenticated"],
      real_groups: [username, ...groups],
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
    if (!groups.includes(this.requiredGroup)) {
      logger.error(
        `Access denied: User "${username}" is not a member of the required GitHub org "${this.requiredGroup}"`,
      )
      return false
    }

    return true
  }
}
