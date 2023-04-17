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

    logger.log("User successfully authenticated:", user)
    return user
  }
}
