import { IPluginMiddleware } from "@verdaccio/types"
import { Application, NextFunction, Request, Response } from "express"

import { GithubClient } from "../github"
import { getConfig, PluginConfig } from "../plugin/PluginConfig"
import { Auth } from "../verdaccio-types"

export class SinopiaGithubOAuthCliSupport implements IPluginMiddleware<any> {

  private readonly github = new GithubClient(
    this.config.user_agent,
    getConfig(this.config, "github-enterprise-hostname"),
  )

  constructor(private readonly config: PluginConfig) { }

  /**
   * Implements the middleware plugin interface.
   */
  register_middlewares(app: Application, auth: Auth) {
    app.use("/oauth/authorize", (req: Request, res: Response) => {
      res.redirect("/-/oauth/authorize/cli")
    })

    app.use("/-/oauth/callback/cli", async (req: Request, res: Response, next: NextFunction) => {
      const code = req.query.code
      const clientId = getConfig(this.config, "client-id")
      const clientSecret = getConfig(this.config, "client-secret")

      try {
        const oauth = await this.github.requestAccessToken(code, clientId, clientSecret)
        const user = await this.github.requestUser(oauth.access_token)

        const npmAuthPayload = user.login + ":" + oauth.access_token
        const npmAuthToken = auth.aesEncrypt(new Buffer(npmAuthPayload)).toString("base64")

        res.redirect("http://localhost:8239?token=" + encodeURIComponent(npmAuthToken))
      } catch (error) {
        next(error)
      }
    })
  }

}
