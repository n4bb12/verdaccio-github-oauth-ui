import { Handler, Request, Response } from "express"
import { get } from "lodash"
import querystring from "querystring"

import { GithubClient } from "../github"
import { Callback } from "./Callback"
import { getConfig, PluginConfig } from "./Config"

export class Authorization {

  static readonly path = "/-/oauth/authorize/:id?"

  private readonly github = new GithubClient(
    this.config.user_agent,
    getConfig(this.config, "github-enterprise-hostname"),
  )

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
  middleware: Handler = (req: Request, res: Response, next) => {
    const id = (req.params.id || "")
    const qs = {
      client_id: getConfig(this.config, "client-id"),
      redirect_uri: this.getRedirectUrl(req) + (id ? `/${id}` : ""),
      scope: "read:org",
    }
    const url = this.github.constructGithubUIHostname() + `/login/oauth/authorize?` +
      querystring.stringify(qs)
    res.redirect(url)
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
