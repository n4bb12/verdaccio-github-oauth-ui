import { stringify } from "querystring"
import { authenticatedUserGroups } from "../../constants"
import { logger } from "../../logger"
import { ParsedPluginConfig } from "./Config"
import { User, Verdaccio } from "./Verdaccio"

export class AuthCore {
  constructor(
    private readonly verdaccio: Verdaccio,
    private readonly config: ParsedPluginConfig,
  ) {}
  
  async createAuthenticatedUser(
    userName: string,
    userGroups: string[],
  ): Promise<User> {
    const relevantGroups = userGroups
      .filter((group) => this.config.isGroupConfigured(group))
      .filter(Boolean)
      .sort()

    const user: User = {
      name: userName,
      groups: [...authenticatedUserGroups],
      real_groups: relevantGroups,
    }

    logger.log("User successfuly authenticated:", user)
    return user
  }

  async createUiCallbackUrl(
    userName: string,
    userGroups: string[],
    userToken: string,
  ): Promise<string> {
    const user = await this.createAuthenticatedUser(userName, userGroups)

    const uiToken = await this.verdaccio.issueUiToken(user)
    const npmToken = await this.verdaccio.issueNpmToken(user, userToken)

    const query = { username: userName, uiToken, npmToken }
    const url = "/?" + stringify(query)

    return url
  }
}
