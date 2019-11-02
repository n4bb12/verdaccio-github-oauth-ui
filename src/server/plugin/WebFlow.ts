import { IPluginMiddleware } from "@verdaccio/types"
import { Application, Handler, Request } from "express"

import { AuthCore } from "./AuthCore"
import { AuthProvider } from "./AuthProvider"
import { authorizePath, callbackPath } from "./Config"
import { logger } from "./logger"

export class WebFlow implements IPluginMiddleware<any> {

  static getAuthorizePath(id?: string) {
    return authorizePath + "/" + (id || ":id?")
  }

  static getCallbackPath(id?: string) {
    return callbackPath + (id ? "/" + id : "")
  }

  constructor(
    private readonly core: AuthCore,
    private readonly provider: AuthProvider,
  ) { }

  /**
   * IPluginMiddleware
   */
  register_middlewares(app: Application) {
    app.get(WebFlow.getAuthorizePath(), this.authorize)
    app.get(WebFlow.getCallbackPath(), this.callback)
  }

  /**
   * Initiates the auth flow by redirecting to the provider's login URL.
   */
  authorize: Handler = async (req, res, next) => {
    try {
      const redirectUrl = this.getRedirectUrl(req)
      const url = await this.provider.getLoginUrl(redirectUrl)
      res.redirect(url)
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  /**
   * After successful authentication, the auth provider redirects back to us.
   * We use the code in the query params to get an access token and the username
   * associated with the account.
   *
   * We issue a JWT using these values and pass them back to the frontend as
   * query parameters so they can be stored in the browser.
   *
   * The username and token are encryped and base64 encoded to form a token for
   * the npm CLI.
   *
   * There is no need to later decode and decrypt the token. This process is
   * automatically reversed by verdaccio before passing it to the plugin.
   */
  callback: Handler = async (req, res, next) => {
    try {
      const code = await this.provider.getCode(req)
      const token = await this.provider.getToken(code)
      const username = await this.provider.getUsername(token)
      const groups = await this.provider.getGroups(token)

      if (this.core.shouldAllowAccess(username, groups)) {
        const frontendUrl = await this.core.getFrontendUrl(username, token)
        res.redirect(frontendUrl)
      } else {
        const errorPage = this.core.getErrorPage(username)
        res.send(errorPage)
      }
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  private getRedirectUrl(req: Request): string {
    const baseUrl = this.core.getBaseUrl() || this.getRequestOrigin(req)
    const path = WebFlow.getCallbackPath(req.params.id)
    return baseUrl + path
  }

  private getRequestOrigin(req: Request) {
    const protocal = req.get("X-Forwarded-Proto") || req.protocol
    return protocal + "://" + req.get("host")
  }

}
