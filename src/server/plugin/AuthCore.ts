import { intersection } from "lodash"
import { stringify } from "querystring"

import { User, Verdaccio } from "../verdaccio"
import { Config, getConfig } from "./Config"
import { logger } from "./logger"

export class AuthCore {

  private readonly requiredGroup = getConfig(this.config, "org")

  constructor(
    private readonly verdaccio: Verdaccio,
    private readonly config: Config,
  ) { }

  createUser(username: string) {
    return {
      name: username,
      groups: [this.requiredGroup],
      real_groups: [this.requiredGroup],
    }
  }

  async getFrontendUrl(username: string, token: string) {
    const user: User = this.createUser(username)

    const uiToken = await this.verdaccio.issueUiToken(user)
    const npmToken = await this.verdaccio.issueNpmToken(username, token)

    const query = { username, uiToken, npmToken }
    const frontendUrl = "/?" + stringify(query)

    return frontendUrl
  }

  getErrorPage(username: string) {
    return `${this.deniedMessage(username)}<br><a href="/">Go back</a>`
  }

  canAuthenticate(username: string, groups: string[]) {
    const allow = groups.includes(this.requiredGroup)
    if (!allow) {
      logger.error(this.deniedMessage(username))
    }
    return allow
  }

  canAccess(username: string, groups: string[], requiredGroups: string[]) {
    if (requiredGroups.includes("$authenticated")) {
      requiredGroups.push(this.requiredGroup)
    }
    const grantedAccess = intersection(groups, requiredGroups)

    const allow = grantedAccess.length === requiredGroups.length
    if (!allow) {
      logger.error(this.deniedMessage(username))
    }
    return allow
  }

  private deniedMessage(username: string) {
    return `Access denied: user "${username}" is not a member of "${this.requiredGroup}"`
  }

}
