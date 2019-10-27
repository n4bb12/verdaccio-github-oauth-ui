import { IPluginMiddleware } from "@verdaccio/types"
import { Application, NextFunction, Request, Response } from "express"
import { stringify } from "querystring"

import { GitHubClient } from "../github"
import { Authorization } from "../plugin/Authorization"
import { Callback } from "../plugin/Callback"
import { getConfig, PluginConfig } from "../plugin/Config"
import { Auth } from "../verdaccio"

const cliAuthorizeUrl = "/oauth/authorize"
const cliCallbackUrl = "http://localhost:8239"
const pluginOAuthId = "/sinopia-github-oauth-cli"

export class SinopiaGithubOAuthCliSupport implements IPluginMiddleware<any> {

  private readonly clientId = getConfig(this.config, "client-id")
  private readonly clientSecret = getConfig(this.config, "client-secret")
  private readonly enterpriseOrigin = getConfig(this.config, "enterprise-origin")
  private readonly github = new GitHubClient(this.config.user_agent, this.enterpriseOrigin)

  constructor(
    private readonly config: PluginConfig,
    private readonly auth: Auth,
  ) { }

  /**
   * Implements the middleware plugin interface.
   */
  register_middlewares(app: Application) {
    app.get(cliAuthorizeUrl, (req: Request, res: Response) => {
      res.redirect(Authorization.path.replace("/:id?", pluginOAuthId))
    })

    app.get(Callback.path + pluginOAuthId, async (req: Request, res: Response, next: NextFunction) => {
      try {
        const code = req.query.code

        const githubOauth = await this.github.requestAccessToken(code, this.clientId, this.clientSecret)
        const githubUser = await this.github.requestUser(githubOauth.access_token)

        const npmAuth = githubUser.login + ":" + githubOauth.access_token
        const encryptedNpmToken = this.encrypt(npmAuth)

        const query = { token: encodeURIComponent(encryptedNpmToken) }
        const url = cliCallbackUrl + "?" + stringify(query)

        res.redirect(url)
      } catch (error) {
        next(error)
      }
    })
  }

  private encrypt(text: string) {
    return this.auth.aesEncrypt(new Buffer(text)).toString("base64")
  }

}
