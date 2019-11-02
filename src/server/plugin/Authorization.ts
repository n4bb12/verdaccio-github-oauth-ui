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
   * IPluginMiddleware
   */
  register_middlewares(app: Application) {
    app.get(Authorization.path(), this.authorize)
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
   * This is where the auth provider should redirect back to.
   */
  private getRedirectUrl(req: Request): string {
    const baseUrl = getBaseUrl(this.config) || this.getRequestOrigin(req)
    const path = Callback.path(req.params.id)

    return baseUrl + path
  }

  private getRequestOrigin(req: Request) {
    const protocal = req.get("X-Forwarded-Proto") || req.protocol
    return protocal + "://" + req.get("host")
  }

}
