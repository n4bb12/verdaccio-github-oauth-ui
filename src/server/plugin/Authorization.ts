import { Handler, NextFunction, Request, Response } from "express"
import { get } from "lodash"
import { stringify } from "querystring"

import { GitHubClient } from "../github"
import { Callback } from "./Callback"
import { getConfig, PluginConfig } from "./Config"

export class Authorization {

  static readonly path = "/-/oauth/authorize/:id?"

  private readonly clientId = getConfig(this.config, "client-id")
  private readonly enterpriseOrigin = getConfig(this.config, "enterprise-origin")
  private readonly github = new GitHubClient(this.config.user_agent, this.enterpriseOrigin)

  constructor(
    private readonly config: PluginConfig,
  ) { }

  /**
   * Initiates the GitHub OAuth flow by redirecting to GitHub.
   * The callback URL can be customized by subpathing the request.
   *
   * Example:
   *   A request to `/-/oauth/authorize/cheese-cake` will be called back at
   *   `/-/oauth/callback/cheese-cake`.
   */
  middleware: Handler = (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = (req.params.id || "")
      const query = {
        client_id: this.clientId,
        redirect_uri: this.getRedirectUrl(req) + (id ? `/${id}` : ""),
        scope: "read:org",
      }
      const url = this.github.webBaseUrl + `/login/oauth/authorize?` + stringify(query)
      res.redirect(url)
    } catch (error) {
      next(error)
    }
  }

  /**
   * This is where GitHub should redirect back to.
   */
  getRedirectUrl(req: Request): string {
    return this.getRegistryUrl(req) + Callback.path
  }

  /**
   * This is the same as what `npm config get registry` returns.
   */
  getRegistryUrl(req: Request): string {
    const prefix = get(this.config, "url_prefix", "")
    if (prefix) {
      return prefix.replace(/\/?$/, "") // Remove potential trailing slash
    }
    const protocal = req.get("X-Forwarded-Proto") || req.protocol
    return protocal + "://" + req.get("host")
  }

}
