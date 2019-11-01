import { Handler, NextFunction, Request, Response } from "express"
import { stringify } from "querystring"

import { GitHubAuthProvider } from "../github"
import { Auth, getSecurity, User } from "../verdaccio"
import { getConfig, getMajorVersion, PluginConfig } from "./Config"

export class Callback {

  static readonly path = "/-/oauth/callback"

  private readonly requiredGroup = getConfig(this.config, "org")
  private readonly provider = new GitHubAuthProvider(this.config)
  private readonly version = getMajorVersion(this.config)

  constructor(
    private readonly config: PluginConfig,
    private readonly auth: Auth,
  ) { }

  /**
   * After a successful OAuth authentication, GitHub redirects back to us.
   * We use the OAuth code to get an OAuth access token and the username associated
   * with the GitHub account.
   *
   * The token and username are encryped and base64 encoded and configured as npm
   * credentials for this registry. There is no need to later decode and decrypt the token.
   * This process is automatically reversed before the token is passed to the authenticate
   * middleware.
   *
   * We then issue a JWT token using these values and pass them back to the frontend
   * as query parameters so they can be stored in the browser.
   */
  middleware: Handler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = req.query.code

      const token = await this.provider.getToken(code)
      const username = await this.provider.getUsername(token)
      const groups = await this.provider.getGroups(token)

      if (groups.includes(this.requiredGroup)) {
        await this.grantAccess(res, token, username)
      } else {
        await this.denyAccess(res)
      }
    } catch (error) {
      next(error)
    }
  }

  private async grantAccess(res: Response, token: string, username: string) {
    const npmAuth = username + ":" + token
    const encryptedNpmToken = this.encrypt(npmAuth)

    const user: User = {
      name: username,
      groups: [this.requiredGroup],
      real_groups: [this.requiredGroup],
    }

    const encryptedJWT = this.version === 3
      ? await this.issueJWTVerdaccio3(user)
      : await this.issueJWTVerdaccio4(user)

    const frontendUrl = "/?" + stringify({
      username,
      jwtToken: encryptedJWT,
      npmToken: encryptedNpmToken,
    })

    console.log(frontendUrl)

    res.redirect(frontendUrl)
  }

  private denyAccess(res: Response) {
    res.send(`
      Access denied: you are not a member of "${this.requiredGroup}"<br>
      <a href="/">Go back</a>
    `)
  }

  // https://github.com/verdaccio/verdaccio/blob/3.x/src/api/web/endpoint/user.js#L15
  private async issueJWTVerdaccio3(user: User) {
    return this.auth.issueUIjwt(user, "24h")
  }

  // https://github.com/verdaccio/verdaccio/blob/master/src/api/web/endpoint/user.ts#L31
  private async issueJWTVerdaccio4(user: User) {
    const jWTSignOptions = getSecurity(this.config).web.sign
    return this.auth.jwtEncrypt(user, jWTSignOptions)
  }

  private encrypt(text: string) {
    return this.auth.aesEncrypt(new Buffer(text)).toString("base64")
  }

}
