import { intersection } from "lodash"
import { stringify } from "querystring"

import { Auth, getSecurity, User } from "../verdaccio"
import { Config, getBaseUrl, getConfig, getMajorVersion } from "./Config"
import { accessDeniedMessage, logger } from "./logger"

export class AuthCore {

  private readonly baseUrl = getBaseUrl(this.config)
  private readonly majorVersion = getMajorVersion(this.config)
  private readonly requiredGroup = getConfig(this.config, "org")

  constructor(
    private readonly config: Config,
    private readonly verdaccio: Auth,
  ) { }

  async getFrontendUrl(username: string, token: string) {
    const user: User = {
      name: username,
      groups: [this.requiredGroup],
      real_groups: [this.requiredGroup],
    }

    const uiToken = this.majorVersion === 3
      ? await this.issueJWTVerdaccio3(user)
      : await this.issueJWTVerdaccio4(user)

    const npmToken = this.getNpmToken(username, token)

    const query = { username, uiToken, npmToken }
    const frontendUrl = "/?" + stringify(query)

    return frontendUrl
  }

  getErrorPage(username: string) {
    return `${accessDeniedMessage(username, this.requiredGroup)}<br><a href="/">Go back</a>`
  }

  getNpmToken(username: string, token: string) {
    return this.encrypt(username + ":" + token)
  }

  getBaseUrl() {
    return this.baseUrl
  }

  getMajorVersion() {
    return this.majorVersion
  }

  canAuthenticate(username: string, groups: string[]) {
    const allow = groups.includes(this.requiredGroup)
    if (!allow) {
      logger.error(accessDeniedMessage(username, this.requiredGroup))
    }
    return allow
  }

  canAccess(username: string, groups: string[], requiredAccess: string[]) {
    if (requiredAccess.includes("$authenticated")) {
      requiredAccess.push(this.requiredGroup)
    }

    const grantedAccess = intersection(groups, requiredAccess)

    const allow = grantedAccess.length === requiredAccess.length
    if (!allow) {
      logger.error(accessDeniedMessage(username, this.requiredGroup))
    }
    return allow
  }

  private encrypt(text: string) {
    return this.verdaccio.aesEncrypt(new Buffer(text)).toString("base64")
  }

  // https://github.com/verdaccio/verdaccio/blob/3.x/src/api/web/endpoint/user.js#L15
  private async issueJWTVerdaccio3(user: User) {
    return this.verdaccio.issueUIjwt(user, "24h")
  }

  // https://github.com/verdaccio/verdaccio/blob/master/src/api/web/endpoint/user.ts#L31
  private async issueJWTVerdaccio4(user: User) {
    const jWTSignOptions = getSecurity(this.config).web.sign
    return this.verdaccio.jwtEncrypt(user, jWTSignOptions)
  }

}
