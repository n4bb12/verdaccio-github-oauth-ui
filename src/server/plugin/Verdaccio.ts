import type { Auth } from "@verdaccio/auth"
import { JWTSignOptions, RemoteUser } from "@verdaccio/types"
import { VerdaccioGithubOauthConfig } from "./Config"

export type User = RemoteUser
export type { Auth }

// Most of this is duplicated Verdaccio code because it is unfortunately not available via API.
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function mergeObjects<Base extends object, Extra>(
  base: Base,
  extra: Extra,
): Base & Extra {
  const result: Record<string, unknown> = { ...base } as Record<string, unknown>
  if (!isPlainObject(extra)) return result as Base & Extra

  for (const [key, value] of Object.entries(extra)) {
    if (value === undefined) continue
    const current = result[key]
    result[key] =
      isPlainObject(current) && isPlainObject(value)
        ? mergeObjects(current, value)
        : value
  }

  return result as Base & Extra
}

function getSecurity(config: VerdaccioGithubOauthConfig) {
  return mergeObjects(defaultSecurity, config.security)
}

type Security = ReturnType<typeof getSecurity>

/**
 * Abstract Verdaccio version differences and usage of all Verdaccio objects.
 */
export class Verdaccio {
  readonly security: Security

  private auth!: Auth

  constructor(private readonly config: VerdaccioGithubOauthConfig) {
    this.security = getSecurity(this.config)
  }

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

  private encrypt(text: string): string {
    try {
      return this.auth.aesEncrypt(text) ?? ""
    } catch (error) {
      if (String(error).includes("TypeError")) {
        // Older versions of Verdaccio accept a buffer and return a buffer.
        // @ts-expect-error Buffer was the previous aesEncrypt argument type
        return this.auth.aesEncrypt(Buffer.from(text)).toString("base64")
      }
      throw error
    }
  }
}
