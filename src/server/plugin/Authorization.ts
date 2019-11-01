import { Handler, NextFunction, Request, Response } from "express"

import { AuthProvider } from "./AuthProvider"
import { Callback } from "./Callback"
import { getBaseUrl, PluginConfig } from "./Config"

export class Authorization {

  static path(id?: string) {
    return "/-/oauth/authorize/" + (id || ":id?")
  }

  constructor(
    private readonly config: PluginConfig,
    private readonly provider: AuthProvider,
  ) { }

  /**
   * Initiates the OAuth flow by redirecting to the auth provider's login URL.
   * The callback URL can be customized by subpathing the request.
   *
   * Example:
   *   A request to `/-/oauth/authorize/cheese-cake` will be called back at
   *   `/-/oauth/callback/cheese-cake`.
   */
  middleware: Handler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redirectUrl = this.getRedirectUrl(req)
      const url = await this.provider.getLoginUrl(redirectUrl)
      res.redirect(url)
    } catch (error) {
      next(error)
    }
  }

  /**
   * This is where the auth provider should redirect back to.
   */
  getRedirectUrl(req: Request): string {
    const baseUrl = getBaseUrl(this.config) || this.getRequestOrigin(req)
    const path = Callback.path(req.params.id)

    return baseUrl + path
  }

  /**
   * This is the same as what `npm config get registry` returns.
   */
  getRequestOrigin(req: Request) {
    const protocal = req.get("X-Forwarded-Proto") || req.protocol
    return protocal + "://" + req.get("host")
  }

}
