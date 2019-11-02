import { IPluginMiddleware } from "@verdaccio/types"
import { Application, Handler, Request } from "express"

import { AuthProvider } from "./AuthProvider"
import { Callback } from "./Callback"
import { authorizePath, Config, getBaseUrl } from "./Config"
import { logger } from "./logger"

export class Authorization implements IPluginMiddleware<any> {

  static path(id?: string) {
    return authorizePath + "/" + (id || ":id?")
  }

  constructor(
    private readonly config: Config,
    private readonly provider: AuthProvider,
  ) { }

  /**
   * Implements the middleware plugin interface.
   */
  register_middlewares(app: Application) {
    app.get(Authorization.path(), this.authorize)
  }

  /**
   * Initiates the OAuth flow by redirecting to the auth provider's login URL.
   * The callback URL can be customized by subpathing the request.
   *
   * Example:
   *   A request to `/-/oauth/authorize/cheese-cake` will be called back at
   *   `/-/oauth/callback/cheese-cake`.
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
   * This is where the auth provider should redirect back to.
   */
  private getRedirectUrl(req: Request): string {
    const baseUrl = getBaseUrl(this.config) || this.getRequestOrigin(req)
    const path = Callback.path(req.params.id)

    return baseUrl + path
  }

  /**
   * This is the same as what `npm config get registry` returns.
   */
  private getRequestOrigin(req: Request) {
    const protocal = req.get("X-Forwarded-Proto") || req.protocol
    return protocal + "://" + req.get("host")
  }

}
