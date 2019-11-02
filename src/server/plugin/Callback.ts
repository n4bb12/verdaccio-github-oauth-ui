import { IPluginMiddleware } from "@verdaccio/types"
import { Application, Handler, NextFunction, Request, Response } from "express"
import { stringify } from "querystring"

import { Auth, getSecurity, User } from "../verdaccio"
import { AuthProvider } from "./AuthProvider"
import { Config, getConfig, getMajorVersion } from "./Config"

export class Callback implements IPluginMiddleware<any> {

  static path(id?: string) {
    return "/-/oauth/callback" + (id ? "/" + id : "")
  }

  private readonly majorVersion = getMajorVersion(this.config)
  private readonly requiredGroup = getConfig(this.config, "org")

  constructor(
    private readonly config: Config,
    private readonly provider: AuthProvider,
    private readonly verdaccioAuth: Auth,
  ) { }

  /**
   * Implements the middleware plugin interface.
   */
  register_middlewares(app: Application) {
    app.get(Callback.path(), this.receiveOAuthCode)
  }

  /**
   * After a successful OAuth authentication, the auth provider redirects back to us.
   * We use the code in the query params to get an access token and the username associated
   * with the account.
   *
   * The token and username are encryped and base64 encoded and configured as npm
   * credentials for this registry. There is no need to later decode and decrypt the token.
   * This process is automatically reversed before the token is passed to the authenticate
   * middleware.
   *
   * We then issue a JWT token using these values and pass them back to the frontend
   * as query parameters so they can be stored in the browser.
   */
  receiveOAuthCode: Handler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = await this.provider.getCode(req)
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
    const npmToken = this.encrypt(npmAuth)

    const user: User = {
      name: username,
      groups: [this.requiredGroup],
      real_groups: [this.requiredGroup],
    }

    const uiToken = this.majorVersion === 3
      ? await this.issueJWTVerdaccio3(user)
      : await this.issueJWTVerdaccio4(user)

    const query = { username, uiToken, npmToken }
    const frontendUrl = "/?" + stringify(query)

    res.redirect(frontendUrl)
  }

  private denyAccess(res: Response) {
    res.send(`
      Access denied: you are not a member of "${this.requiredGroup}"<br>
      <a href="/">Go back</a>
    `)
  }

  private encrypt(text: string) {
    return this.verdaccioAuth.aesEncrypt(new Buffer(text)).toString("base64")
  }

  // https://github.com/verdaccio/verdaccio/blob/3.x/src/api/web/endpoint/user.js#L15
  private async issueJWTVerdaccio3(user: User) {
    return this.verdaccioAuth.issueUIjwt(user, "24h")
  }

  // https://github.com/verdaccio/verdaccio/blob/master/src/api/web/endpoint/user.ts#L31
  private async issueJWTVerdaccio4(user: User) {
    const jWTSignOptions = getSecurity(this.config).web.sign
    return this.verdaccioAuth.jwtEncrypt(user, jWTSignOptions)
  }

}
