import {
  Config,
  IBasicAuth,
  JWTSignOptions,
  RemoteUser,
} from "@verdaccio/types"
import { NextFunction } from "express"
import merge from "lodash/merge"
import { getVersion, VerdaccioConfig } from "../plugin/Config"

export interface Auth extends IBasicAuth<Config> {
  config: Config
  apiJWTmiddleware(): NextFunction
  jwtEncrypt(user: RemoteUser, signOptions: JWTSignOptions): Promise<string>
  webUIJWTmiddleware(): NextFunction
}

export type User = RemoteUser

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

function getSecurity(config: VerdaccioConfig) {
  return merge({}, defaultSecurity, config.security)
}

/**
 * Abstract Verdaccio version differences and usage of all Verdaccio objects.
 */
export class Verdaccio {
  readonly security = getSecurity(this.config)

  private auth!: Auth

  constructor(private readonly config: VerdaccioConfig) {}

  setAuth(auth: Auth): Verdaccio {
    this.auth = auth
    return this
  }

  async issueNpmToken(user: User, token: string) {
    const jwtSignOptions = this.security?.api?.jwt?.sign

    if (jwtSignOptions) {
      return this.issueVerdaccio4PlusJWT(user, jwtSignOptions)
    } else {
      return this.encrypt(user.name + ":" + token)
    }
  }

  async issueUiToken(user: User) {
    const jwtSignOptions = this.security.web.sign

    return this.issueVerdaccio4PlusJWT(user, jwtSignOptions)
  }

  // https://github.com/verdaccio/verdaccio/blob/master/src/api/web/endpoint/user.ts#L31
  private async issueVerdaccio4PlusJWT(
    user: User,
    jwtSignOptions: JWTSignOptions,
  ) {
    return this.auth.jwtEncrypt(user, jwtSignOptions)
  }

  private encrypt(text: string) {
    return this.auth.aesEncrypt(Buffer.from(text)).toString("base64")
  }
}
