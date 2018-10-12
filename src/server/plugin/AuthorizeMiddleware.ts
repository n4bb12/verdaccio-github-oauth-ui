import { Handler, Request, Response } from "express"
import { get } from "lodash"
import * as querystring from "querystring"

import { Config } from "../verdaccio"

import { CallbackMiddleware } from "./CallbackMiddleware"

export class AuthorizeMiddleware {

  public static readonly path = "/-/oauth/authorize/:id?"

  constructor(
    private readonly config: Config,
  ) { }

  /**
   * Initiates the GitHub OAuth flow by redirecting to GitHub.
   * The callback URL can be customized by subpathing the request.
   *
   * Example:
   *   A request to `/-/oauth/authorize/cheese-cake` will be called back at
   *   `/-/oauth/callback/cheese-cake`.
   */
  public middleware: Handler = (req: Request, res: Response, next) => {
    const id = (req.params.id || "")
    const url = "https://github.com/login/oauth/authorize?" + querystring.stringify({
      client_id: process.env[this.config["client-id"]] || this.config["client-id"],
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
    if (prefix) {
      return prefix.replace(/\/?$/, "") // Remove potential trailing slash
    }
    const protocal = req.get("X-Forwarded-Proto") || req.protocol
    return (protocal + "://" + req.get("host"))
  }

}
