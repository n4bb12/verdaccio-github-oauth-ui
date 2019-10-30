import { IPluginMiddleware } from "@verdaccio/types"
import { Application, NextFunction, Request, Response } from "express"
import { stringify } from "querystring"

import { GitLabClient } from "../gitlab"
import { Authorization } from "../plugin/Authorization"
import { Callback } from "../plugin/Callback"
import { getConfig, PluginConfig } from "../plugin/Config"
import { Auth } from "../verdaccio"


const pluginOAuthId = "/gitlab-oauth-cli"

const cliAuthorizeUrl = "/oauth/authorize"
const cliCallbackUrl = "http://localhost:8239"

export class GitlabOAuthCliSupport implements IPluginMiddleware<any> {

  private readonly clientId = getConfig(this.config, "client-id")
  private readonly clientSecret = getConfig(this.config, "client-secret")
  private readonly gitlabHost = getConfig(this.config, "gitlab-host")
  private readonly gitlab = new GitLabClient(this.gitlabHost)

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
        const id = (req.params.id || "")
        const callbackUrl = Callback.getCallbackUrl(req, this.config) + (id ? `/${id}` : "")

        const gitlabOauth = await this.gitlab.requestAccessToken(code, this.clientId, this.clientSecret, callbackUrl)
        const gitlabUser = await this.gitlab.requestUser(gitlabOauth.access_token)

        const npmAuth = gitlabUser.username + ":" + gitlabOauth.access_token
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
