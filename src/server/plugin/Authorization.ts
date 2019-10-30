import { Handler, NextFunction, Request, Response } from "express"

import { GitLabClient } from "../gitlab"
import { Callback } from "./Callback"
import { getConfig, PluginConfig } from "./Config"

export class Authorization {

  static readonly path = "/-/oauth/authorize/:id?"

  private readonly clientId = getConfig(this.config, "client-id")
  private readonly gitlabHost = getConfig(this.config, "gitlab-host")
  private readonly gitlab = new GitLabClient(this.gitlabHost)

  constructor(
    private readonly config: PluginConfig,
  ) { }

  /**
   * Initiates the GitLab OAuth flow by redirecting to GitLab.
   * The callback URL can be customized by subpathing the request.
   *
   * Example:
   *   A request to `/-/oauth/authorize/cheese-cake` will be called back at
   *   `/-/oauth/callback/cheese-cake`.
   */
  middleware: Handler = (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = (req.params.id || "")
      const callbackUrl = Callback.getCallbackUrl(req, this.config) + (id ? `/${id}` : "")
      const url = this.gitlab.getAuthorizationUrl(this.clientId, callbackUrl)
      res.redirect(url)
    } catch (error) {
      next(error)
    }
  }

}
