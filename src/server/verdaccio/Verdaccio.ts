import { Config, JWTSignOptions } from "@verdaccio/types"
import { merge } from "lodash"

import { Auth, User } from "../verdaccio"

// Most of this is duplicated Verdaccio code because it is unfortunately not availabel via API.
// https://github.com/verdaccio/verdaccio/blob/master/src/lib/auth-utils.ts#L129

const TIME_EXPIRATION_7D = "7d" as const

const defaultSecurity = {
  api: {
    legacy: true,
  },
  web: {
    sign: {
      expiresIn: TIME_EXPIRATION_7D,
    },
    verify: {},
  },
} as const

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

function getSecurity(config: Config) {
  return merge({}, defaultSecurity, config.security)
}

/**
 * Abstract Verdaccio version differences and usage of all Verdaccio objects.
 */
export class Verdaccio {
  readonly majorVersion = getMajorVersion(this.config)
  readonly baseUrl = getBaseUrl(this.config)
  readonly security = getSecurity(this.config)

  private auth!: Auth

  constructor(private readonly config: Config) {}

  setAuth(auth: Auth) {
    this.auth = auth
  }

  async issueNpmToken(token: string, user: User) {
    const jwtSignOptions = this.config.security?.api?.jwt?.sign

    if (jwtSignOptions) {
      return this.issueJWTVerdaccio4(user, jwtSignOptions)
    } else {
      return this.encrypt(user.name + ":" + token)
    }
  }

  async issueUiToken(user: User) {
    const jwtSignOptions = this.security.web.sign

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
