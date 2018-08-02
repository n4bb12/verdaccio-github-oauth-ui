import { Request, Response } from "express"
import { get } from "lodash"
import * as querystring from "querystring"

import { CallbackMiddleware } from "./CallbackMiddleware"

export class AuthorizeMiddleware {

  public static readonly path = "/-/oauth/authorize/:id?"

  constructor(
    private readonly config: any,
  ) { }

  /**
   * Initiates the GitHub OAuth flow by redirecting to GitHub.
   * The callback URL can be customized by subpathing the request.
   * 
   * Example:
   *   A request to `/authorize/cheese-cake` will be called back at
   *   `/callback/cheese-cake`.
   */
  public middleware = (req: Request, res: Response, next) => {
    const id = (req.params.id || "")
    const url = "https://github.com/login/oauth/authorize?" + querystring.stringify({
      client_id: this.config["client-id"],
      redirect_uri: this.getRedirectUrl(req) + (id ? `/${id}` : ""),
      scope: "read:org",
    })
    res.redirect(url)
  }

  /**
   * This is where GitHub should redirect back to.
   */
  public getRedirectUrl(req: Request): string {
    return this.getRegistryUrl(req) + CallbackMiddleware.path
  }

  /**
   * This is the same as what `npm config get registry` returns.
   */
  public getRegistryUrl(req: Request): string {
    const prefix = get(this.config, "url_prefix", "")
      .replace(/\/?$/, "") // Remove trailing slash if needed
    return (req.protocol + "://" + req.get("host") + prefix)
  }

}
