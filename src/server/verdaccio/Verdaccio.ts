import { Config, JWTSignOptions } from "@verdaccio/types"

import { Auth, User } from "../verdaccio"
import { getSecurity } from "./verdaccio-4-auth-utils"

/**
 * user_agent: e.g. "verdaccio/4.3.4" --> 4
 */
function getMajorVersion(config: Config) {
  return +config.user_agent[10]
}

function getBaseUrl(config: Config) {
  const prefix = config.url_prefix
  if (prefix) {
    return prefix.replace(/\/?$/, "") // Remove potential trailing slash
  }
  return ""
}

/**
 * Abstract Verdaccio version differences and usage of all Verdaccio objects.
 */
export class Verdaccio {
  readonly majorVersion = getMajorVersion(this.config)
  readonly baseUrl = getBaseUrl(this.config)

  private auth!: Auth

  constructor(private readonly config: Config) {}

  setAuth(auth: Auth) {
    this.auth = auth
  }

  async issueNpmToken(token: string, username: string, groups: string[]) {
    const jwtSignOptions = getSecurity(this.config).api?.jwt?.sign

    if (jwtSignOptions) {
      const user: User = { real_groups: groups, groups, name: username }
      return this.issueJWTVerdaccio4(user, jwtSignOptions)
    } else {
      return this.encrypt(username + ":" + token)
    }
  }

  async issueUiToken(user: User) {
    const jwtSignOptions = getSecurity(this.config).web.sign

    return this.majorVersion === 3
      ? this.issueJWTVerdaccio3(user)
      : this.issueJWTVerdaccio4(user, jwtSignOptions)
  }

  // https://github.com/verdaccio/verdaccio/blob/3.x/src/api/web/endpoint/user.js#L15
  private issueJWTVerdaccio3(user: User) {
    return this.auth.issueUIjwt(user, "24h")
  }

  // https://github.com/verdaccio/verdaccio/blob/master/src/api/web/endpoint/user.ts#L31
  private async issueJWTVerdaccio4(user: User, jwtSignOptions: JWTSignOptions) {
    return this.auth.jwtEncrypt(user, jwtSignOptions)
  }

  private encrypt(text: string) {
    return this.auth.aesEncrypt(new Buffer(text)).toString("base64")
  }
}
