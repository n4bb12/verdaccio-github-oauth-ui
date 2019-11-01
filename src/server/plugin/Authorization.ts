import { Handler, NextFunction, Request, Response } from "express"

import { AuthProvider } from "./AuthProvider"
import { Callback } from "./Callback"
import { PluginConfig } from "./Config"

export class Authorization {

  static readonly path = "/-/oauth/authorize/:id?"

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
    const id = (req.params.id || "")
    return this.getRegistryUrl(req) + Callback.path + (id ? `/${id}` : "")
  }

  /**
   * This is the same as what `npm config get registry` returns.
   */
  getRegistryUrl(req: Request): string {
    const prefix = this.config.url_prefix || ""
    if (prefix) {
      return prefix.replace(/\/?$/, "") // Remove potential trailing slash
    }
    const protocal = req.get("X-Forwarded-Proto") || req.protocol
    return protocal + "://" + req.get("host")
  }

}
