// This is duplicated here because it is unfortunately not availabel via API.
// https://github.com/verdaccio/verdaccio/blob/master/src/lib/auth-utils.ts#L129

import { APITokenOptions, Config, JWTOptions, Security } from "@verdaccio/types"
import { isNil, merge } from "lodash"

const TIME_EXPIRATION_7D = "7d"

const defaultWebTokenOptions: JWTOptions = {
  sign: {
    // The expiration token for the website is 7 days
    expiresIn: TIME_EXPIRATION_7D,
  },
  verify: {},
}

const defaultApiTokenConf: APITokenOptions = {
  legacy: true,
}

const defaultSecurity: Security = {
  web: defaultWebTokenOptions,
  api: defaultApiTokenConf,
}

export function getSecurity(config: Config): Security {
  if (isNil(config.security) === false) {
    return merge(defaultSecurity, config.security)
  }

  return defaultSecurity
}
